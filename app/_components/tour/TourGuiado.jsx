'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { PASSOS } from './passos';

/* ============================================================
   Tutorial guiado.

   Implementação própria, sem biblioteca de tour. Não é purismo: o que
   existe pronto traz CSS próprio que teria de ser sobrescrito peça por
   peça para não destoar do resto do app, e o recorte de destaque aqui é
   um box-shadow gigante — não compensa uma dependência a mais no bundle
   por isso.

   A regra que mais importa está no `visiveis`: passo cujo alvo não
   existe é pulado, e o tutorial segue. A tela de quem acabou de criar a
   conta não tem trilho de dinheiro nem KPI — abortar tudo quando falta
   um alvo deixaria justamente o novato sem tutorial nenhum.
   ============================================================ */

const MARGEM = 8;      /* respiro entre o recorte e o elemento destacado */
const ESPACO = 14;     /* distância do balão até o elemento */
const LARGURA = 360;

export default function TourGuiado({ aberto, aoFechar, chaveConclusao }) {
  const [indice, setIndice] = useState(0);
  const [alvoRect, setAlvoRect] = useState(null);
  const [visiveis, setVisiveis] = useState([]);
  const balaoRef = useRef(null);

  /* Monta o roteiro no momento em que abre, não na renderização: os
     alvos dependem da tela em que a pessoa está. */
  useEffect(() => {
    if (!aberto) return;
    setVisiveis(PASSOS.filter((p) => !p.alvo || document.querySelector(p.alvo)));
    setIndice(0);
  }, [aberto]);

  const passo = visiveis[indice];

  const medir = useCallback(() => {
    if (!passo?.alvo) return setAlvoRect(null);
    const el = document.querySelector(passo.alvo);
    if (!el) return setAlvoRect(null);
    const r = el.getBoundingClientRect();
    setAlvoRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [passo]);

  /* Traz o alvo para a tela antes de medir, senão o recorte fica fora da
     área visível em telas menores. */
  useEffect(() => {
    if (!aberto || !passo) return;
    const el = passo.alvo ? document.querySelector(passo.alvo) : null;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t = setTimeout(medir, el ? 320 : 0);
    return () => clearTimeout(t);
  }, [aberto, passo, medir]);

  useEffect(() => {
    if (!aberto) return;
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', medir, true);
    return () => {
      window.removeEventListener('resize', medir);
      window.removeEventListener('scroll', medir, true);
    };
  }, [aberto, medir]);

  const fechar = useCallback((concluido) => {
    /* Guarda tanto em concluir quanto em fechar no meio: quem saiu no
       passo 2 decidiu que não quer, e reabrir sozinho no próximo login
       seria insistência. O menu da clínica reabre quando a pessoa
       quiser. */
    if (chaveConclusao) {
      try {
        localStorage.setItem(chaveConclusao, concluido ? 'concluido' : 'dispensado');
      } catch {
        /* modo privado ou storage cheio: o tutorial reaparece na próxima
           visita, o que é bem menos grave do que quebrar a tela. */
      }
    }
    aoFechar?.();
  }, [chaveConclusao, aoFechar]);

  useEffect(() => {
    if (!aberto) return;
    function onKey(e) {
      if (e.key === 'Escape') fechar(false);
      if (e.key === 'ArrowRight' && indice < visiveis.length - 1) setIndice((i) => i + 1);
      if (e.key === 'ArrowLeft' && indice > 0) setIndice((i) => i - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto, indice, visiveis.length, fechar]);

  useEffect(() => {
    if (aberto) balaoRef.current?.focus();
  }, [aberto, indice]);

  if (!aberto || !passo) return null;

  const ultimo = indice === visiveis.length - 1;

  /* Posição do balão. Sem alvo ele fica centralizado; com alvo, encosta
     no lado pedido e cai para o lado oposto quando não cabe. */
  let estiloBalao;
  if (!alvoRect) {
    estiloBalao = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  } else {
    const cabeAbaixo = alvoRect.top + alvoRect.height + ESPACO + 220 < window.innerHeight;
    const lado = passo.posicao === 'direita' && alvoRect.left + alvoRect.width + ESPACO + LARGURA < window.innerWidth;

    if (lado) {
      estiloBalao = {
        top: Math.max(12, Math.min(alvoRect.top, window.innerHeight - 260)),
        left: alvoRect.left + alvoRect.width + ESPACO,
      };
    } else {
      const esq = Math.max(12, Math.min(alvoRect.left, window.innerWidth - LARGURA - 12));
      estiloBalao = cabeAbaixo
        ? { top: alvoRect.top + alvoRect.height + ESPACO, left: esq }
        : { top: Math.max(12, alvoRect.top - ESPACO - 220), left: esq };
    }
  }

  return (
    <div className="rg-tour" role="dialog" aria-modal="true" aria-labelledby="rg-tour-titulo">
      {/* Escurece a tela. Com alvo, o box-shadow gigante faz o recorte:
          o retângulo em si fica transparente e a sombra cobre o resto. */}
      {alvoRect ? (
        <div
          className="rg-tour-recorte"
          style={{
            top: alvoRect.top - MARGEM,
            left: alvoRect.left - MARGEM,
            width: alvoRect.width + MARGEM * 2,
            height: alvoRect.height + MARGEM * 2,
          }}
        />
      ) : (
        <div className="rg-tour-veu" onClick={() => fechar(false)} />
      )}

      <div className="rg-tour-balao" style={estiloBalao} ref={balaoRef} tabIndex={-1}>
        <button
          type="button"
          className="rg-tour-fechar"
          onClick={() => fechar(false)}
          aria-label="Fechar tutorial"
        >
          <X size={16} />
        </button>

        <p className="rg-tour-contador">
          {indice + 1} de {visiveis.length}
        </p>
        <h2 className="rg-h2" id="rg-tour-titulo" style={{ margin: '0 0 6px' }}>
          {passo.titulo}
        </h2>
        <p className="rg-sub" style={{ margin: 0 }}>{passo.texto}</p>

        <div className="rg-tour-acoes">
          {indice > 0 && (
            <button type="button" className="rg-btn rg-btn-ghost rg-btn-sm" onClick={() => setIndice((i) => i - 1)}>
              Voltar
            </button>
          )}
          <div className="rg-spacer" />
          {!ultimo && (
            <button type="button" className="rg-btn rg-btn-ghost rg-btn-sm" onClick={() => fechar(false)}>
              Pular
            </button>
          )}
          {ultimo ? (
            <>
              {passo.acao && (
                <a href={passo.acao.href} className="rg-btn rg-btn-primary rg-btn-sm" onClick={() => fechar(true)}>
                  {passo.acao.texto}
                </a>
              )}
              <button type="button" className="rg-btn rg-btn-secondary rg-btn-sm" onClick={() => fechar(true)}>
                Fechar
              </button>
            </>
          ) : (
            <button type="button" className="rg-btn rg-btn-primary rg-btn-sm" onClick={() => setIndice((i) => i + 1)}>
              Próximo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
