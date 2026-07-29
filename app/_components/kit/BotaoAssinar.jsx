'use client';

import { useState } from 'react';
import { CTA_ASSINAR } from '@/lib/plano';

/* Botão de assinar, único em todo o app.

   Antes cada tela resolvia isso do seu jeito: umas navegavam para
   /configuracoes (obrigando um segundo clique), outras para uma aba
   ?tab=assinatura que não existe. Aqui ele sempre abre o checkout do
   Stripe direto. */
export default function BotaoAssinar({ variante = 'primary', tamanho = '', bloco = false, rotulo }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function assinar() {
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const dados = await res.json();

      if (dados.checkoutUrl) {
        window.location.href = dados.checkoutUrl;
        return;
      }

      /* 409: já existe assinatura ativa. Acontece quando o webhook não
         atualizou o banco — o app acha que é gratuito, o Stripe sabe que
         não. Dizer isso é melhor que abrir uma segunda cobrança. */
      setErro(
        dados.error === 'assinatura_existente'
          ? 'Você já tem uma assinatura ativa. Use "Gerenciar assinatura" em Configurações.'
          : 'Não foi possível abrir o pagamento. Tente novamente.'
      );
    } catch (e) {
      console.error('Erro ao abrir checkout:', e);
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  const classes = [
    'rg-btn',
    `rg-btn-${variante}`,
    tamanho && `rg-btn-${tamanho}`,
    bloco && 'rg-btn-block',
  ].filter(Boolean).join(' ');

  return (
    <>
      <button type="button" className={classes} onClick={assinar} disabled={carregando}>
        {carregando ? 'Abrindo…' : (rotulo ?? CTA_ASSINAR)}
      </button>
      {erro && (
        <p role="alert" className="rg-caption" style={{ color: '#991b1b', marginTop: 8 }}>
          {erro}
        </p>
      )}
    </>
  );
}
