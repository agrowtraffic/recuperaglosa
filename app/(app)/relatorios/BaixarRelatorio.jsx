'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { formatarCompetencia } from '@/lib/relatorios';

/* Baixa o relatório em PDF sob demanda, do histórico inteiro ou de uma
   competência.

   Até então o relatório só saía do app pelo envio automático do dia 1º,
   sempre do mês anterior. Quem precisa fechar o trimestre com o contador,
   ou reenviar um mês específico, não tinha por onde. */
export default function BaixarRelatorio({ competencias = [] }) {
  const [mes, setMes] = useState('');
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState('');

  async function baixar() {
    setBaixando(true);
    setErro('');
    try {
      const res = await fetch(`/api/relatorio/pdf${mes ? `?mes=${mes}` : ''}`);

      if (!res.ok) {
        if (res.status === 401) setErro('Sua sessão expirou. Entre novamente para baixar.');
        else if (res.status === 404) setErro('Nenhum demonstrativo nessa competência.');
        else setErro('Não foi possível gerar o PDF.');
        return;
      }

      /* Via blob, e não navegando direto para a rota: assim o nome do
         arquivo definido no Content-Disposition é respeitado e a aba
         atual não sai da tela. */
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-glosas-${mes || new Date().toISOString().slice(0, 10)}.pdf`;
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
      {/* Com uma competência só, escolher não é escolha: o seletor some e
          o botão baixa o que existe. */}
      {competencias.length > 1 && (
        <>
          <label htmlFor="rel-mes" className="rg-sr-only">Competência do relatório</label>
          <select
            id="rel-mes"
            className="rg-select"
            value={mes}
            onChange={(e) => { setMes(e.target.value); setErro(''); }}
            disabled={baixando}
          >
            <option value="">Todo o histórico</option>
            {competencias.map((c) => (
              <option key={c} value={c}>{formatarCompetencia(c)}</option>
            ))}
          </select>
        </>
      )}

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
