'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';

/* Zona de upload do /lotes. Usa a mesma rota /api/upload que já valida
   plano, limite mensal, parseia o TISS e persiste com RLS. */
export default function UploadZone({ isGratuito, analisesRestantes }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [arrastando, setArrastando] = useState(false);

  const limiteAtingido = isGratuito && analisesRestantes <= 0;

  function selecionar(f) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.xml')) {
      setErro('Apenas arquivos .xml são aceitos.');
      return;
    }
    setErro('');
    setSucesso('');
    setArquivo(f);
  }

  async function enviar() {
    if (!arquivo || enviando) return;
    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) {
        setErro(json.message || 'Não foi possível processar o arquivo.');
        return;
      }

      setSucesso(json.message || 'Demonstrativo processado.');
      setArquivo(null);
      if (inputRef.current) inputRef.current.value = '';
      router.refresh(); // atualiza histórico e contador
    } catch (e) {
      console.error('Erro no upload:', e);
      setErro('Erro de conexão ao enviar o arquivo.');
    } finally {
      setEnviando(false);
    }
  }

  if (limiteAtingido) {
    return (
      <section className="rg-card rg-card-pad">
        <div className="rg-stack-sm" style={{ alignItems: 'center', textAlign: 'center', padding: '24px 0' }}>
          <span className="rg-empty-icon"><UploadCloud size={24} /></span>
          <h2 className="rg-h2">Limite do plano gratuito atingido</h2>
          <p className="rg-sub">
            Você já usou as 3 análises gratuitas deste mês. Assine para enviar sem limite.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="rg-card rg-card-pad rg-upload"
      style={arrastando ? { borderColor: 'var(--rg-brand, #128437)' } : undefined}
      onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        selecionar(e.dataTransfer.files?.[0]);
      }}
    >
      <div className="rg-stack-sm" style={{ alignItems: 'center', textAlign: 'center', padding: '24px 0' }}>
        <span className="rg-empty-icon"><UploadCloud size={24} /></span>
        <h2 className="rg-h2">{arquivo ? arquivo.name : 'Arraste o XML aqui'}</h2>
        <p className="rg-sub">Padrão TISS. Um arquivo por vez.</p>

        <input
          ref={inputRef}
          type="file"
          accept=".xml"
          className="rg-sr"
          id="lote-arquivo"
          onChange={(e) => selecionar(e.target.files?.[0])}
        />

        <div className="rg-row rg-row-wrap" style={{ justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <label htmlFor="lote-arquivo" className="rg-btn rg-btn-secondary rg-btn-lg" style={{ cursor: 'pointer' }}>
            {arquivo ? 'Trocar arquivo' : 'Escolher arquivo'}
          </label>
          <button
            type="button"
            className="rg-btn rg-btn-primary rg-btn-lg"
            disabled={!arquivo || enviando}
            onClick={enviar}
          >
            {enviando ? 'Analisando…' : 'Analisar demonstrativo'}
          </button>
        </div>

        {erro && (
          <p role="alert" className="rg-caption" style={{ color: '#991b1b', marginTop: 4 }}>
            ⚠ {erro}
          </p>
        )}
        {sucesso && (
          <p role="status" className="rg-caption" style={{ color: '#166534', marginTop: 4 }}>
            ✓ {sucesso}
          </p>
        )}

        {isGratuito && (
          <p className="rg-caption">
            {analisesRestantes} de 3 análises gratuitas restantes este mês
          </p>
        )}
      </div>
    </section>
  );
}
