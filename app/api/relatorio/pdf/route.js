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
  desempenhoPorOperadora, recursosAguardando, resumoDosRecursos, formatarCompetencia,
} from '@/lib/relatorios';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/* Mesmo formato do RecursoPDF, para os dois documentos da clínica não
   divergirem no separador nem no número de casas. */
const brl = (n) =>
  `R$ ${Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* Rótulo do período coberto. Sem isso o documento impresso não diz a que
   período se refere — e quem arquiva o PDF descobre isso tarde demais. */
function rotularPeriodo(porCompetencia) {
  const competencias = porCompetencia
    .map((c) => c.competencia)
    .filter((c) => c && c !== '—')
    .sort();

  if (!competencias.length) return 'todo o histórico';
  if (competencias.length === 1) return formatarCompetencia(competencias[0]);
  return `${formatarCompetencia(competencias[0])} a ${formatarCompetencia(competencias[competencias.length - 1])}`;
}

export async function GET(request) {
  try {
    const { supabase, clinicaId, clinica } = await getContexto();

    if (!clinicaId) {
      /* Sem clínica não há o que relatar. 401 e não 403: o caso real é
         sessão expirada, e o cliente trata redirecionando para o login. */
      return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 });
    }

    /* ?mes=AAAA-MM recorta uma competência; sem o parâmetro, o PDF cobre
       todo o histórico, que é o que a tela mostra. */
    const mes = new URL(request.url).searchParams.get('mes');

    if (mes && !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
      return NextResponse.json(
        { error: 'mes_invalido', esperado: 'AAAA-MM' },
        { status: 400 }
      );
    }

    const [todosLotes, todasGlosas, todosRecursos] = await Promise.all([
      getLotes(supabase, clinicaId),
      getGlosas(supabase, clinicaId),
      getRecursos(supabase, clinicaId),
    ]);

    /* Filtra as três listas pelo mesmo critério. Recortar só os lotes
       deixaria os totais de glosa e de recurso falando de outro período —
       o cabeçalho diria "julho" e os números seriam do histórico inteiro. */
    const doMes = (item) => !mes || item.competencia === mes;
    const lotes = todosLotes.filter(doMes);
    const glosas = todasGlosas.filter(doMes);
    const recursos = todosRecursos.filter(doMes);

    if (mes && !lotes.length) {
      return NextResponse.json(
        { error: 'sem_dados_no_periodo' },
        { status: 404 }
      );
    }

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

    /* Quem baixa todo mês acumula os PDFs na mesma pasta, e
       "relatorio-glosas.pdf (3)" não diz de quando é. Com recorte, o nome
       leva a competência; sem recorte, a data de emissão. */
    const carimbo = mes || new Date().toISOString().slice(0, 10);

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
