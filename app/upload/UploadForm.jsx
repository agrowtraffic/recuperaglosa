'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadForm({ clinicaId, isGratuito }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Selecione um arquivo XML para continuar.');
      return;
    }

    setLoading(true);

    try {
      // ✅ Enviar arquivo real para a rota
      const formData = new FormData();
      formData.append('arquivo', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      // ✅ Tratamento de erros
      if (!res.ok) {
        if (json.error === 'limite_atingido') {
          setError('🔒 ' + json.message);
        } else {
          setError(json.message || 'Não foi possível processar o arquivo.');
        }
        setLoading(false);
        return;
      }

      // ✅ Sucesso
      setSuccess(true);
      setFile(null);

      setTimeout(() => {
        router.push('/'); // Redirecionar para dashboard
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erro ao processar arquivo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          padding: '32px',
          border: '2px dashed #cbd5e1',
          borderRadius: '12px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          background: '#f8fafc',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#16a34a';
          e.currentTarget.style.background = '#eaf7ef';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.background = '#f8fafc';
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.background = '#f8fafc';
          const dropped = e.dataTransfer.files[0];
          if (dropped?.name.endsWith('.xml')) {
            setFile(dropped);
            setError('');
          } else {
            setError('Apenas arquivos .xml são aceitos.');
          }
        }}
      >
        <input
          type="file"
          accept=".xml"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) {
              setFile(selected);
              setError('');
            }
          }}
          style={{ display: 'none' }}
          id="fileInput"
        />
        <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📥</div>
          <p style={{ marginTop: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
            {file ? file.name : 'Arraste aqui ou clique para selecionar'}
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0 0' }}>
            Suportados: XML (TISS/ANS)
          </p>
        </label>
      </div>

      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            borderRadius: '8px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
            borderRadius: '8px',
            fontSize: '13px',
          }}
        >
          ✅ Arquivo processado com sucesso! Redirecionando...
        </div>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        style={{
          width: '100%',
          marginTop: '20px',
          padding: '12px',
          background: !file || loading ? '#cbd5e1' : '#16a34a',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: !file || loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
        }}
      >
        {loading ? '⏳ Processando...' : 'Analisar Demonstrativo'}
      </button>

      {isGratuito && (
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '16px' }}>
          Plano grátis: máx 3 análises/mês
        </p>
      )}
    </form>
  );
}
