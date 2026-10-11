'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import AjudaUpload from './AjudaUpload';

/* Falhas em que o problema é o arquivo ou o processamento, e portanto
   vale oferecer ajuda. Ficam de fora o 402 (limite do plano) e o 409
   (arquivo repetido), que a própria mensagem já resolve. */
const STATUS_COM_AJUDA = [400, 422, 500];

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
  const [ajuda, setAjuda] = useState(null); // { motivo, arquivo } do último envio que falhou

  const limiteAtingido = isGratuito && analisesRestantes <= 0;

  function selecionar(f) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.xml')) {
      setErro('Apenas arquivos .xml são aceitos.');
      // Quem só tem o demonstrativo em PDF trava aqui: também vale oferecer ajuda.
      setAjuda({ motivo: 'nao_e_xml', arquivo: f.name });
      return;
    }
    setErro('');
    setSucesso('');
    setAjuda(null);
    setArquivo(f);
  }

  /* Quem não tem um demonstrativo à mão tenta qualquer XML e trava. O
     exemplo mostra o resultado em segundos, sem gastar análise grátis. */
  async function analisarExemplo() {
    if (enviando) return;
    try {
      const res = await fetch('/exemplos/demonstrativo-exemplo.xml');
      const blob = await res.blob();
      await enviar(new File([blob], 'demonstrativo-exemplo.xml', { type: 'text/xml' }), true);
    } catch (e) {
      console.error('Erro ao carregar o exemplo:', e);
      setErro('Não foi possível carregar o exemplo. Tente novamente.');
    }
  }

  async function enviar(arquivoEnvio = arquivo, ehExemplo = false) {
    if (!arquivoEnvio || enviando) return;
    setEnviando(true);
    setErro('');
    setSucesso('');
    setAjuda(null);

    try {
      const formData = new FormData();
      formData.append('arquivo', arquivoEnvio);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      // Falha do servidor pode vir sem JSON; aí vale a mensagem padrão e a oferta de ajuda.
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (ehExemplo && res.status === 409) {
          setErro('O exemplo já foi analisado. Veja o resultado no histórico abaixo.');
        } else {
          setErro(json.message || 'Não foi possível processar o arquivo.');
          if (STATUS_COM_AJUDA.includes(res.status)) {
            setAjuda({ motivo: json.error || `http_${res.status}`, arquivo: arquivoEnvio.name });
          }
        }
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
            onClick={() => enviar()}
          >
            {enviando ? 'Analisando…' : 'Analisar demonstrativo'}
          </button>
        </div>

        <p className="rg-caption" style={{ marginTop: 4 }}>
          Sem um demonstrativo à mão?{' '}
          <button
            type="button"
            onClick={analisarExemplo}
            disabled={enviando}
            style={{ background: 'none', border: 0, padding: 0, color: 'var(--rg-brand, #128437)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
          >
            Analisar um exemplo
          </button>
          {' '}(não gasta sua análise gratuita).
        </p>
        <p className="rg-caption">
          O arquivo certo é o demonstrativo de pagamento ou de análise de conta que a operadora devolve. Modelos de
          recurso ou lotes de guias enviados por você não funcionam.
        </p>

        {erro && (
          <p role="alert" className="rg-caption" style={{ color: '#991b1b', marginTop: 4 }}>
            ⚠ {erro}
          </p>
        )}
        {ajuda && <AjudaUpload motivo={ajuda.motivo} arquivo={ajuda.arquivo} />}
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
