'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';

/* Copiar e baixar. Ambos só aparecem para quem tem o texto completo —
   o gate de verdade está no servidor (getRecurso e a rota do PDF); isto
   aqui é só a interface. */
export default function AcoesRecurso({ recursoId, guia, texto, liberado }) {
  const [copiado, setCopiado] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState('');

  if (!liberado) return null;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro('Não foi possível copiar. Selecione o texto manualmente.');
    }
  }

  async function baixarPdf() {
    setBaixando(true);
    setErro('');
    try {
      const res = await fetch(`/api/recurso/${recursoId}/pdf`);

      if (!res.ok) {
        const detalhe = await res.json().catch(() => ({}));
        setErro(detalhe.message || 'Não foi possível gerar o PDF.');
        return;
      }

      /* Baixa via blob para respeitar o nome do arquivo e não perder a
         sessão numa navegação direta. */
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recurso-glosa-${guia}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro ao baixar PDF:', e);
      setErro('Erro de conexão ao gerar o PDF.');
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="rg-row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" className="rg-btn rg-btn-secondary rg-btn-sm" onClick={copiar}>
        {copiado ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar texto</>}
      </button>
      <button
        type="button"
        className="rg-btn rg-btn-primary rg-btn-sm"
        onClick={baixarPdf}
        disabled={baixando}
      >
        <Download size={15} /> {baixando ? 'Gerando…' : 'Baixar PDF'}
      </button>
      {erro && (
        <span role="alert" className="rg-caption" style={{ color: '#991b1b' }}>
          {erro}
        </span>
      )}
    </div>
  );
}
