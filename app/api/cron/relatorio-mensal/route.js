/* ============================================================
   RELATÓRIO MENSAL  →  /api/cron/relatorio-mensal
   Disparado pelo Vercel Cron (ver vercel.json).

   Roda sem sessão de usuário: percorre TODAS as clínicas, então usa
   service_role. Isso contorna o RLS de propósito — é o único jeito de
   um job agendado ver o banco inteiro. Justamente por isso a rota
   precisa da checagem de CRON_SECRET logo na entrada.
   ============================================================ */
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { enviarRelatorioMensal } from '@/lib/emails';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/* Primeiro e último instante do mês anterior ao de referência. */
function janelaMesAnterior(agora = new Date()) {
  const inicio = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - 1, 1, 0, 0, 0));
  const fim = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), 1, 0, 0, 0));
  return { inicio, fim };
}

/* Janela de um mês explícito, no formato AAAA-MM. Serve para rodar o
   relatório à mão — testar antes do dia 1, ou reenviar um mês que
   falhou — sem depender de esperar o cron. */
function janelaDoMes(texto) {
  const m = /^(\d{4})-(\d{2})$/.exec(texto);
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return null;
  return {
    inicio: new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0)),
    fim: new Date(Date.UTC(ano, mes, 1, 0, 0, 0)),
  };
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function rotularCompetencia(data) {
  return `${MESES[data.getUTCMonth()]}/${data.getUTCFullYear()}`;
}

export async function GET(request) {
  /* ── Autorização ──
     O Vercel Cron manda `Authorization: Bearer $CRON_SECRET`. Sem o
     segredo configurado a rota fica fechada: liberar por omissão
     deixaria um endpoint que varre o banco inteiro aberto na internet. */
  const segredo = process.env.CRON_SECRET;

  if (!segredo) {
    console.error('[CRON] CRON_SECRET não configurado — rota bloqueada.');
    return NextResponse.json({ error: 'cron_nao_configurado' }, { status: 503 });
  }

  if (request.headers.get('authorization') !== `Bearer ${segredo}`) {
    return NextResponse.json({ error: 'nao_autorizado' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'supabase_nao_configurado' }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey);

  /* ?mes=AAAA-MM roda uma competência específica; sem o parâmetro, usa o
     mês anterior, que é o comportamento do agendamento. */
  const mesPedido = new URL(request.url).searchParams.get('mes');
  const janela = mesPedido ? janelaDoMes(mesPedido) : janelaMesAnterior();

  if (!janela) {
    return NextResponse.json(
      { error: 'mes_invalido', esperado: 'AAAA-MM' },
      { status: 400 }
    );
  }

  const { inicio, fim } = janela;
  const competencia = rotularCompetencia(inicio);

  const relatorio = {
    competencia,
    periodo: { de: inicio.toISOString(), ate: fim.toISOString() },
    clinicas: 0,
    enviados: 0,
    pulados: 0,
    falhas: 0,
    naoEnviados: [], // e-mail montado mas não entregue (ex: Resend sem chave)
  };

  try {
    const { data: clinicas, error: erroClinicas } = await supabase
      .from('clinica')
      .select('id, nome, plano');

    if (erroClinicas) throw erroClinicas;

    relatorio.clinicas = clinicas?.length ?? 0;

    for (const clinica of clinicas ?? []) {
      try {
        const { data: lotes } = await supabase
          .from('lote')
          .select('total_apresentado, total_pago, total_glosado')
          .eq('clinica_id', clinica.id)
          .gte('criado_em', inicio.toISOString())
          .lt('criado_em', fim.toISOString());

        /* Clínica sem movimento no período não recebe e-mail. Resumo
           zerado é ruído — e ruído mensal é o que faz o cliente criar
           filtro para a nossa caixa. */
        if (!lotes?.length) {
          relatorio.pulados += 1;
          continue;
        }

        const apresentado = lotes.reduce((s, l) => s + Number(l.total_apresentado ?? 0), 0);
        const pago = lotes.reduce((s, l) => s + Number(l.total_pago ?? 0), 0);
        const glosado = lotes.reduce((s, l) => s + Number(l.total_glosado ?? 0), 0);

        /* O destinatário é o dono (role 'owner'). Convite de equipe ainda
           não existe, mas quando existir o resumo financeiro não deve ir
           para todo mundo por padrão. */
        const { data: dono } = await supabase
          .from('usuario')
          .select('email')
          .eq('clinica_id', clinica.id)
          .eq('role', 'owner')
          .limit(1)
          .maybeSingle();

        if (!dono?.email) {
          console.warn(`[CRON] Clínica ${clinica.id} sem dono com e-mail — pulada.`);
          relatorio.pulados += 1;
          continue;
        }

        const envio = await enviarRelatorioMensal({
          para: dono.email,
          nomeClinica: clinica.nome,
          competencia,
          apresentado,
          pago,
          glosado,
          planoPago: clinica.plano === 'ativo',
        });

        if (envio.enviado) {
          relatorio.enviados += 1;
        } else {
          /* Não é falha da clínica: o e-mail foi montado corretamente e
             não saiu por configuração (ex: Resend sem chave). Contar como
             erro esconderia que o conteúdo está certo. */
          relatorio.naoEnviados.push({
            clinica: clinica.nome,
            motivo: envio.motivo,
            assunto: envio.assunto ?? null,
          });
          console.warn(`[CRON] Clínica ${clinica.id} não notificada: ${envio.motivo}`);
        }
      } catch (e) {
        /* Uma clínica com problema não pode impedir o resumo das outras. */
        relatorio.falhas += 1;
        console.error(`[CRON] Falha na clínica ${clinica.id}:`, e.message);
      }
    }

    console.log('[CRON] Relatório mensal concluído:', JSON.stringify(relatorio));
    return NextResponse.json({ ok: true, ...relatorio });
  } catch (e) {
    console.error('[CRON] Falha geral no relatório mensal:', e.message);
    return NextResponse.json({ ok: false, erro: e.message, ...relatorio }, { status: 500 });
  }
}
