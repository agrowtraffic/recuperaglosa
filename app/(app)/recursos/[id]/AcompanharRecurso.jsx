'use client';

/* ============================================================
   Onde o recurso sai de "rascunho".

   O documento já nasce pronto — o que faltava era registrar o que
   aconteceu com ele depois: foi enviado? a operadora aceitou?
   Sem isso o funil ficava travado e "Recuperado" era sempre R$ 0,00.
   ============================================================ */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ThumbsUp, ThumbsDown, Undo2 } from 'lucide-react';
import { mudarStatusRecurso } from './actions';
import { formatarValorInput } from '@/lib/valor';
import { Money } from '@/app/_components/kit/Primitives';

export default function AcompanharRecurso({
  recursoId,
  status,
  valorPleiteado = 0,
  valorRecuperado,
  enviadoEm,
  resolvidoEm,
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState('');
  /* Qual botão foi clicado, para o "Salvando…" aparecer só nele e não
     em todos ao mesmo tempo. */
  const [alvo, setAlvo] = useState(null);

  /* Registrar pagamento abre um passo a mais: quanto entrou. A operadora
     costuma reverter só parte da glosa, e assumir aceite integral faria
     o card "Recuperado" reportar dinheiro que não chegou. */
  const [confirmandoPagamento, setConfirmandoPagamento] = useState(false);
  const [valorTexto, setValorTexto] = useState('');

  function mudar(novoStatus, valor) {
    setErro('');
    setAlvo(novoStatus);
    iniciar(async () => {
      const r = await mudarStatusRecurso(recursoId, novoStatus, valor);
      setAlvo(null);
      if (r?.error) {
        setErro(r.error);
        return;
      }
      setConfirmandoPagamento(false);
      setValorTexto('');
      // Recarrega o Server Component: o funil e a lista mudam junto.
      router.refresh();
    });
  }

  function abrirConfirmacao() {
    setErro('');
    // Pré-preenche com o pleiteado: aceite integral é o caso comum e
    // não deve exigir digitação.
    setValorTexto(formatarValorInput(valorPleiteado));
    setConfirmandoPagamento(true);
  }

  const rotulo = (destino, texto) =>
    pendente && alvo === destino ? 'Salvando…' : texto;

  const parcial =
    valorRecuperado != null && valorRecuperado < valorPleiteado;

  return (
    <div className="rg-stack-sm">
      {status === 'rascunho' && (
        <>
          <p className="rg-caption">
            Baixe o PDF, envie à operadora pelo canal de sempre e marque aqui —
            é o que move este valor para o funil e permite registrar o resultado depois.
          </p>
          <div className="rg-row rg-row-wrap" style={{ gap: 8 }}>
            <button
              type="button"
              className="rg-btn rg-btn-primary rg-btn-sm"
              disabled={pendente}
              onClick={() => mudar('enviado')}
            >
              <Send size={15} /> {rotulo('enviado', 'Marcar como enviado')}
            </button>
          </div>
        </>
      )}

      {status === 'enviado' && !confirmandoPagamento && (
        <>
          <p className="rg-caption">
            Enviado{enviadoEm ? ` em ${enviadoEm}` : ''}. Quando a operadora responder,
            registre o resultado — é assim que o valor entra em “Recuperado”.
          </p>
          <div className="rg-row rg-row-wrap" style={{ gap: 8 }}>
            <button
              type="button"
              className="rg-btn rg-btn-primary rg-btn-sm"
              disabled={pendente}
              onClick={abrirConfirmacao}
            >
              <ThumbsUp size={15} /> A operadora pagou
            </button>
            <button
              type="button"
              className="rg-btn rg-btn-secondary rg-btn-sm"
              disabled={pendente}
              onClick={() => mudar('perdido')}
            >
              <ThumbsDown size={15} /> {rotulo('perdido', 'Manteve a glosa')}
            </button>
            {/* Marcar como enviado sem querer é fácil; desfazer precisa
                estar à mão, não escondido num menu. */}
            <button
              type="button"
              className="rg-btn rg-btn-ghost rg-btn-sm"
              disabled={pendente}
              onClick={() => mudar('rascunho')}
            >
              <Undo2 size={15} /> {rotulo('rascunho', 'Ainda não enviei')}
            </button>
          </div>
        </>
      )}

      {status === 'enviado' && confirmandoPagamento && (
        <div className="rg-stack-sm">
          <label htmlFor="valor-recebido" className="rg-caption" style={{ display: 'block' }}>
            Quanto a operadora pagou deste recurso? Se reverteu a glosa inteira,
            confirme o valor que já está aí.
          </label>
          <div className="rg-row rg-row-wrap" style={{ gap: 8, alignItems: 'center' }}>
            <div className="rg-row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="rg-caption" style={{ fontWeight: 700 }}>R$</span>
              <input
                id="valor-recebido"
                className="rg-input"
                style={{ width: 130 }}
                inputMode="decimal"
                autoFocus
                value={valorTexto}
                onChange={(e) => setValorTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') mudar('ganho', valorTexto);
                  if (e.key === 'Escape') setConfirmandoPagamento(false);
                }}
                aria-describedby="valor-recebido-ajuda"
              />
            </div>
            <button
              type="button"
              className="rg-btn rg-btn-primary rg-btn-sm"
              disabled={pendente}
              onClick={() => mudar('ganho', valorTexto)}
            >
              {rotulo('ganho', 'Confirmar recebimento')}
            </button>
            <button
              type="button"
              className="rg-btn rg-btn-ghost rg-btn-sm"
              disabled={pendente}
              onClick={() => { setConfirmandoPagamento(false); setErro(''); }}
            >
              Cancelar
            </button>
          </div>
          <p id="valor-recebido-ajuda" className="rg-caption">
            Pleiteado: <Money valor={valorPleiteado} tam="sm" />. Pagamento parcial é
            comum — registre o que entrou de fato, não o que foi pedido.
          </p>
        </div>
      )}

      {(status === 'ganho' || status === 'perdido') && (
        <>
          {status === 'ganho' ? (
            <p className="rg-caption">
              {parcial ? (
                <>
                  Recebido <Money valor={valorRecuperado} tam="sm" cor="var(--rg-recuperado-h)" /> dos{' '}
                  <Money valor={valorPleiteado} tam="sm" /> pleiteados
                  {resolvidoEm ? `, em ${resolvidoEm}` : ''}. A diferença de{' '}
                  <Money valor={valorPleiteado - valorRecuperado} tam="sm" /> não foi revertida.
                </>
              ) : (
                <>
                  Recuperado{resolvidoEm ? ` em ${resolvidoEm}` : ''} — a operadora reverteu a
                  glosa integralmente. Este valor entrou no total recuperado da clínica.
                </>
              )}
            </p>
          ) : (
            <p className="rg-caption">
              A operadora manteve a glosa{resolvidoEm ? ` em ${resolvidoEm}` : ''}. Se houver
              nova resposta, reabra para corrigir o registro.
            </p>
          )}
          <div className="rg-row rg-row-wrap" style={{ gap: 8 }}>
            <button
              type="button"
              className="rg-btn rg-btn-ghost rg-btn-sm"
              disabled={pendente}
              onClick={() => mudar('enviado')}
            >
              <Undo2 size={15} /> {rotulo('enviado', 'Reabrir — registrei errado')}
            </button>
          </div>
        </>
      )}

      {erro && (
        <p role="alert" className="rg-caption" style={{ color: 'var(--rg-perdido-h)' }}>
          ⚠ {erro}
        </p>
      )}
    </div>
  );
}
