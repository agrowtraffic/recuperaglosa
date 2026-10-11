'use client';

import { useState } from 'react';

/* Aparece só quando um upload falha. É o momento em que a pessoa mais
   precisa de ajuda e em que o suporte menos fica sabendo: antes, quem
   travava aqui ia embora sem deixar contato.

   Dois caminhos, do mais direto ao mais discreto:
   - deixar o WhatsApp para o suporte chamar;
   - abrir a conversa por conta própria (mensagem pronta, sem dado pessoal
     na URL: o cliente decide o que contar).

   O prazo prometido aqui (10 minutos) foi definido pelo dono do produto e
   é mais curto que o de /ajuda (1 dia útil): vale para quem acabou de
   travar no envio. */
const WHATSAPP_SUPORTE =
  'https://wa.me/5511977315655?text=' +
  encodeURIComponent('Olá! Tentei enviar um arquivo no RecuperaGlosa e ele não foi processado. Podem me ajudar?');

export default function AjudaUpload({ motivo, arquivo }) {
  const [telefone, setTelefone] = useState('');
  const [estado, setEstado] = useState('inicial'); // inicial | enviando | enviado
  const [erro, setErro] = useState('');

  async function pedir(e) {
    e.preventDefault();
    if (estado === 'enviando') return;
    setErro('');

    if (telefone.replace(/\D/g, '').length < 10) {
      setErro('Informe o WhatsApp com DDD.');
      return;
    }

    setEstado('enviando');
    try {
      const res = await fetch('/api/ajuda-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone, motivo, arquivo }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(json.message || 'Não foi possível salvar seu número.');
        setEstado('inicial');
        return;
      }
      setEstado('enviado');
    } catch (err) {
      console.error('Erro ao pedir ajuda:', err);
      setErro('Erro de conexão. Tente de novo ou fale pelo WhatsApp.');
      setEstado('inicial');
    }
  }

  if (estado === 'enviado') {
    return (
      <p role="status" className="rg-caption" style={{ color: '#166534', marginTop: 8 }}>
        ✓ Recebemos seu número. Vamos te chamar no WhatsApp em até 10 minutos.
      </p>
    );
  }

  return (
    <form
      onSubmit={pedir}
      style={{ marginTop: 8, padding: '14px 16px', border: '1px solid var(--rg-line)', borderRadius: 12, width: '100%', maxWidth: 420, textAlign: 'left' }}
    >
      <strong style={{ display: 'block', fontSize: 14 }}>Quer ajuda com este arquivo?</strong>
      <p className="rg-caption" style={{ margin: '2px 0 10px' }}>
        Deixe seu WhatsApp e a gente te chama para resolver.
      </p>

      <div className="rg-row rg-row-wrap" style={{ gap: 8 }}>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="rg-input"
          aria-label="Seu WhatsApp com DDD"
          aria-invalid={erro ? 'true' : undefined}
          placeholder="(11) 99999-0000"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={{ flex: '1 1 160px', minWidth: 0 }}
        />
        <button type="submit" className="rg-btn rg-btn-secondary" disabled={estado === 'enviando'}>
          {estado === 'enviando' ? 'Enviando…' : 'Quero ajuda'}
        </button>
      </div>

      {erro && (
        <p role="alert" className="rg-caption" style={{ color: '#991b1b', margin: '6px 0 0' }}>
          ⚠ {erro}
        </p>
      )}

      <p className="rg-caption" style={{ margin: '10px 0 0' }}>
        Usamos seu número apenas para suporte.{' '}
        <a href={WHATSAPP_SUPORTE} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, textDecoration: 'underline' }}>
          Prefiro chamar agora no WhatsApp
        </a>
      </p>
    </form>
  );
}
