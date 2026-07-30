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

export default function AcompanharRecurso({ recursoId, status, enviadoEm, resolvidoEm }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState('');
  /* Qual botão foi clicado, para o "Salvando…" aparecer só nele e não
     em todos ao mesmo tempo. */
  const [alvo, setAlvo] = useState(null);

  function mudar(novoStatus) {
    setErro('');
    setAlvo(novoStatus);
    iniciar(async () => {
      const r = await mudarStatusRecurso(recursoId, novoStatus);
      setAlvo(null);
      if (r?.error) {
        setErro(r.error);
        return;
      }
      // Recarrega o Server Component: o funil e a lista mudam junto.
      router.refresh();
    });
  }

  const rotulo = (destino, texto) =>
    pendente && alvo === destino ? 'Salvando…' : texto;

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

      {status === 'enviado' && (
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
              onClick={() => mudar('ganho')}
            >
              <ThumbsUp size={15} /> {rotulo('ganho', 'A operadora pagou')}
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

      {(status === 'ganho' || status === 'perdido') && (
        <>
          <p className="rg-caption">
            {status === 'ganho'
              ? `Valor recuperado${resolvidoEm ? ` em ${resolvidoEm}` : ''}. Este recurso entrou no total recuperado da clínica.`
              : `A operadora manteve a glosa${resolvidoEm ? ` em ${resolvidoEm}` : ''}. Se houver nova resposta, reabra para corrigir o registro.`}
          </p>
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
