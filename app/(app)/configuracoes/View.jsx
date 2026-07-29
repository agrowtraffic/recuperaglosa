'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Field, Money } from '@/app/_components/kit/Primitives';
import { CheckCircle2, Upload } from 'lucide-react';
import { ehPago, nomeDoPlano, PLANO_PAGO, PRECO_MENSAL, LOTES_GRATIS_POR_MES } from '@/lib/plano';
import BotaoAssinar from '@/app/_components/kit/BotaoAssinar';
import { atualizarClinica } from './actions';

export default function ConfiguracoesView({
  clinica = {
    nome: '',
    cnpj: '',
    plano: 'trial',
    email_financeiro: '',
    telefone: '',
    cnes: '',
    cidade: '',
  },
  valorRecuperavel = 0,
}) {
  const router = useRouter();
  const [secao, setSecao] = useState('clinica');
  const [salvando, setSalvando] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [nome, setNome] = useState(clinica?.nome ?? '');
  const [cnpj, setCnpj] = useState(clinica?.cnpj ?? '');
  const [feedback, setFeedback] = useState(null); // { tipo: 'ok'|'erro', texto }

  const assinante = ehPago(clinica);
  const plano = nomeDoPlano(clinica);

  async function handleSalvar() {
    setSalvando(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('cnpj', cnpj);

      const resultado = await atualizarClinica(formData);

      if (resultado?.error) {
        setFeedback({ tipo: 'erro', texto: resultado.error });
        return;
      }

      setFeedback({ tipo: 'ok', texto: 'Dados da clínica atualizados.' });
      router.refresh(); // recarrega o Server Component com os dados novos
    } catch (e) {
      console.error('Erro ao salvar clínica:', e);
      setFeedback({ tipo: 'erro', texto: 'Não foi possível salvar. Tente novamente.' });
    } finally {
      setSalvando(false);
    }
  }

  /* Portal do Stripe: é onde o cliente troca cartão, vê faturas e cancela.
     O botão navegava para /configuracoes?tab=assinatura, uma aba que não
     existe — ou seja, quem assinava não tinha como cancelar pelo app. */
  async function handlePortal() {
    setLoadingPortal(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/billing-portal', { method: 'POST' });
      const dados = await response.json();

      if (dados.portalUrl) {
        window.location.href = dados.portalUrl;
        return;
      }

      setFeedback({
        tipo: 'erro',
        texto: dados.error === 'sem_assinatura'
          ? 'Nenhuma assinatura encontrada para esta clínica.'
          : 'Não foi possível abrir o portal de cobrança.',
      });
    } catch (e) {
      console.error('Erro ao abrir portal:', e);
      setFeedback({ tipo: 'erro', texto: 'Não foi possível abrir o portal de cobrança.' });
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader
        eyebrow="Configurações"
        titulo="A base da sua clínica"
        descricao="Dados, plano e equipe em um só lugar."
      />

      {/* ── SEÇÃO: ASSINATURA ── */}
      <section className="rg-card">
        <div className="rg-card-head">
          <h2 className="rg-h2">Plano e cobrança</h2>
        </div>
        <div className="rg-card-pad rg-stack">

          {/* NOVO: Bloco de valor recuperável real */}
          {valorRecuperavel > 0 ? (
            <div
              style={{
                borderRadius: 12,
                padding: '20px',
                background: 'var(--rg-brand-bg, #edfbf2)',
                border: '1px solid var(--rg-brand, #128437)',
                marginBottom: 20,
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#8aa89e' }}>
                VALOR JÁ IDENTIFICADO
              </p>
              <p style={{
                margin: '0 0 4px',
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--rg-brand, #128437)',
              }}>
                <Money valor={valorRecuperavel} tam="lg" cor="var(--rg-brand, #128437)" />
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#5a7a6e', lineHeight: 1.5 }}>
                em glosas recuperáveis. Assine para gerar os recursos de contestação e reaver esse valor.
              </p>
            </div>
          ) : (
            <div
              style={{
                borderRadius: 12,
                padding: '20px',
                background: '#f1f5f9',
                border: '1px solid #dce8e2',
                marginBottom: 20,
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#8aa89e' }}>
                PRÓXIMO PASSO
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: '#2d4a3e', lineHeight: 1.5 }}>
                Envie seu primeiro demonstrativo para descobrir quanto sua clínica pode recuperar.
              </p>
              <button
                type="button"
                className="rg-btn rg-btn-primary"
                onClick={() => router.push('/lotes')}
              >
                <Upload size={16} /> Enviar demonstrativo
              </button>
            </div>
          )}

          {/* Plano atual */}
          <div
            style={{
              borderRadius: 12,
              border: '1px solid #dce8e2',
              padding: '16px',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#8aa89e', textTransform: 'uppercase' }}>
                  Plano atual
                </p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2d4a3e' }}>
                  {plano}
                </p>
              </div>
              <button
                type="button"
                className="rg-btn rg-btn-secondary rg-btn-sm"
                onClick={handlePortal}
                disabled={loadingPortal}
              >
                {loadingPortal ? 'Abrindo…' : 'Gerenciar assinatura'}
              </button>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #dce8e2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#8aa89e' }}>
                  LIMITE MENSAL
                </p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2d4a3e' }}>
                  {assinante ? 'Ilimitado' : `${LOTES_GRATIS_POR_MES} lotes/mês`}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#8aa89e' }}>
                  RECURSOS
                </p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2d4a3e' }}>
                  {assinante ? 'Completos' : 'Só prévia'}
                </p>
              </div>
            </div>
          </div>

          {/* NOVO: Lista de benefícios do plano pago */}
          {!assinante && (
            <>
              <p style={{ margin: '16px 0 8px', fontSize: 13, fontWeight: 700, color: '#2d4a3e' }}>
                No plano {PLANO_PAGO} você ganha:
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {[
                  'Recursos de contestação completos e prontos para enviar',
                  `Lotes ilimitados por mês (hoje: ${LOTES_GRATIS_POR_MES}/mês)`,
                  'Auditoria de todas as guias, sem limite',
                ].map((benefit) => (
                  <li key={benefit} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={20} color="var(--rg-brand, #128437)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: '#2d4a3e', lineHeight: 1.4 }}>
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {!assinante && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #dce8e2' }}>
              <BotaoAssinar bloco />
              <p style={{ margin: '8px 0 0', fontSize: 12, textAlign: 'center', color: '#8aa89e' }}>
                {valorRecuperavel > 0
                  ? `Isso se paga com apenas R$ ${PRECO_MENSAL} do que você já identificou.`
                  : 'Cancelamento a qualquer momento, sem multa.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── SEÇÃO: DADOS DA CLÍNICA ── */}
      <section className="rg-card">
        <div className="rg-card-head">
          <h2 className="rg-h2">Dados da clínica</h2>
        </div>
        <div className="rg-card-pad rg-stack">
          <div className="rg-grid-half">
            <Field id="nome" label="Nome da clínica">
              <input
                id="nome"
                className="rg-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Field>
            <Field id="cnpj" label="CNPJ" ajuda="Aparece nos recursos enviados à operadora">
              <input
                id="cnpj"
                className="rg-input"
                inputMode="numeric"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </Field>
          </div>

          {feedback && (
            <p
              role="status"
              style={{
                margin: 0,
                fontSize: 13,
                color: feedback.tipo === 'ok' ? '#166534' : '#991b1b',
              }}
            >
              {feedback.tipo === 'ok' ? '✓ ' : '⚠ '}{feedback.texto}
            </p>
          )}

          <div className="rg-row">
            <div className="rg-spacer" />
            <button
              type="button"
              className="rg-btn rg-btn-primary"
              disabled={salvando}
              onClick={handleSalvar}
            >
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO: EQUIPE ── */}
      <section className="rg-card">
        <div className="rg-card-head">
          <h2 className="rg-h2">Equipe</h2>
        </div>
        <div className="rg-card-pad rg-stack">
          <button className="rg-btn rg-btn-secondary" disabled title="Em breve">
            Convidar pessoa
          </button>
          <p className="rg-caption">
            Convite de equipe chega em breve. Hoje o acesso é individual por clínica.
          </p>
        </div>
      </section>
    </main>
  );
}
