/* ============================================================
   RELATÓRIO EM PDF  →  /api/relatorio/pdf

   Versão baixável da tela /relatorios. Existe porque até agora o único
   jeito de ter o relatório fora do app era esperar o e-mail do dia 1º —
   e quem precisa mandar o número para o contador ou para o sócio no dia
   12 não tem o que fazer.

   Os números vêm das mesmas funções que a tela usa (lib/dados-clinica e
   lib/relatorios). Recalcular aqui abriria espaço para o PDF divergir do
   que o cliente está vendo — e um relatório que discorda da tela é pior
   do que não ter relatório.
   ============================================================ */
import { renderToBuffer } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { RelatorioPDF } from '@/components/pdf/RelatorioPDF';
import {
  getContexto, getLotes, getGlosas, getRecursos, calcularResumo,
  agruparPorOperadora, agruparPorCompetencia,
} from '@/lib/dados-clinica';
import {
  desempenhoPorOperadora, recursosAguardando, resumoDosRecursos,
} from '@/lib/relatorios';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/* Mesmo formato do RecursoPDF, para os dois documentos da clínica não
   divergirem no separador nem no número de casas. */
const brl = (n) =>
  `R$ ${Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* Rótulo do período coberto. A tela agrega todo o histórico, então o PDF
   declara o intervalo real dos demonstrativos em vez de inventar um mês —
   sem isso o documento impresso não diz a que período se refere. */
function rotularPeriodo(porCompetencia) {
  const competencias = porCompetencia
    .map((c) => c.competencia)
    .filter((c) => c && c !== '—')
    .sort();

  if (!competencias.length) return 'todo o histórico';
  if (competencias.length === 1) return `competência ${competencias[0]}`;
  return `${competencias[0]} a ${competencias[competencias.length - 1]}`;
}

export async function GET() {
  try {
    const { supabase, clinicaId, clinica } = await getContexto();

    if (!clinicaId) {
      /* Sem clínica não há o que relatar. 401 e não 403: o caso real é
         sessão expirada, e o cliente trata redirecionando para o login. */
      return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 });
    }

    const [lotes, glosas, recursos] = await Promise.all([
      getLotes(supabase, clinicaId),
      getGlosas(supabase, clinicaId),
      getRecursos(supabase, clinicaId),
    ]);

    const resumo = calcularResumo({ lotes, glosas, recursos });
    const porOperadora = agruparPorOperadora(lotes);
    const porCompetencia = agruparPorCompetencia(lotes);
    const rec = resumoDosRecursos(recursos);
    const desempenho = desempenhoPorOperadora(recursos);
    const fila = recursosAguardando(recursos);

    const dataEmissao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const buffer = await renderToBuffer(
      RelatorioPDF({
        clinicaNome: clinica?.nome || 'Clínica',
        clinicaCnpj: clinica?.cnpj || '—',
        clinicaLogoUrl: clinica?.logo_url,

        periodo: rotularPeriodo(porCompetencia),
        dataEmissao,

        apresentado: brl(resumo.apresentado),
        recebido: brl(resumo.pago),
        glosado: brl(resumo.glosado),
        recuperado: brl(resumo.recuperado),
        recuperavel: brl(resumo.recuperavel),
        perdido: brl(resumo.perdido),
        emRecurso: brl(resumo.emRecurso),

        qtdGuias: resumo.qtdGuias,
        qtdLotes: lotes.length,

        taxaValor: rec.taxaValor,
        ganhos: rec.ganhos,
        decididos: rec.decididos,

        porOperadora: porOperadora.map((o) => ({
          operadora: o.operadora,
          glosado: brl(o.glosado),
          lotes: o.lotes,
        })),
        desempenho: desempenho.map((d) => ({
          operadora: d.operadora,
          recuperado: brl(d.recuperado),
          taxaValor: d.taxaValor,
          ganhos: d.ganhos,
          decididos: d.decididos,
          aguardando: d.aguardando,
          diasMedios: d.diasMedios,
        })),
        fila: fila.map((f) => ({
          guia: f.guia,
          operadora: f.operadora,
          enviadoEm: f.enviadoEm ?? '—',
          valor: brl(f.valor),
          diasEsperando: f.diasEsperando,
        })),
        porCompetencia: porCompetencia.map((c) => ({
          competencia: c.competencia,
          apresentado: brl(c.apresentado),
          pago: brl(c.pago),
          glosado: brl(c.glosado),
        })),
      })
    );

    /* Data no nome do arquivo: quem baixa todo mês acumula os PDFs na
       mesma pasta, e "relatorio-glosas.pdf (3)" não diz de quando é. */
    const carimbo = new Date().toISOString().slice(0, 10);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-glosas-${carimbo}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[RELATORIO PDF] Falha ao gerar:', err);
    return NextResponse.json({ error: 'falha_ao_gerar' }, { status: 500 });
  }
}
