'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

/* Baixa o relatório em PDF sob demanda.

   Até agora o relatório só saía do app pelo e-mail do dia 1º. Quem
   precisa mandar o número para o contador no dia 12 ficava sem opção. */
export default function BaixarRelatorio() {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState('');

  async function baixar() {
    setBaixando(true);
    setErro('');
    try {
      const res = await fetch('/api/relatorio/pdf');

      if (!res.ok) {
        setErro(
          res.status === 401
            ? 'Sua sessão expirou. Entre novamente para baixar.'
            : 'Não foi possível gerar o PDF.'
        );
        return;
      }

      /* Via blob, e não navegando direto para a rota: assim o nome do
         arquivo definido no Content-Disposition é respeitado e a aba
         atual não sai da tela. */
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-glosas-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro ao baixar relatório:', e);
      setErro('Erro de conexão ao gerar o PDF.');
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="rg-row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <button
        type="button"
        className="rg-btn rg-btn-secondary rg-btn-sm"
        onClick={baixar}
        disabled={baixando}
      >
        <Download size={15} /> {baixando ? 'Gerando…' : 'Baixar PDF'}
      </button>
      {erro && (
        <span role="alert" className="rg-caption" style={{ color: 'var(--rg-glosado-h)' }}>
          {erro}
        </span>
      )}
    </div>
  );
}
