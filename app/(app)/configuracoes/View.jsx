'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Field, Money } from '@/app/_components/kit/Primitives';
import { CheckCircle2, Upload } from 'lucide-react';

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
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const plano = clinica?.plano === 'ativo' || clinica?.plano === 'profissional' ? 'Profissional' : 'Gratuito';

  async function handleCheckout() {
    setLoadingCheckout(true);
    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      const { checkoutUrl } = await response.json();
      if (checkoutUrl) window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
    } finally {
      setLoadingCheckout(false);
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
                onClick={() => router.push('/configuracoes?tab=assinatura')}
              >
                Gerenciar assinatura
              </button>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #dce8e2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#8aa89e' }}>
                  LIMITE MENSAL
                </p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2d4a3e' }}>
                  3 lotes/mês
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#8aa89e' }}>
                  RECURSOS
                </p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2d4a3e' }}>
                  Com prévia
                </p>
              </div>
            </div>
          </div>

          {/* NOVO: Lista de benefícios do plano pago */}
          {plano === 'Gratuito' && (
            <>
              <p style={{ margin: '16px 0 8px', fontSize: 13, fontWeight: 700, color: '#2d4a3e' }}>
                No plano pago você ganha:
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {[
                  'Recursos de contestação completos e prontos para enviar',
                  'Lotes ilimitados por mês (hoje: 3/mês)',
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

          {/* CTA melhorado */}
          {plano === 'Gratuito' && valorRecuperavel > 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #dce8e2' }}>
              <button
                type="button"
                className="rg-btn rg-btn-primary"
                onClick={handleCheckout}
                disabled={loadingCheckout}
                style={{ width: '100%' }}
              >
                {loadingCheckout ? 'Processando...' : 'Assinar agora — R$ 197/mês'}
              </button>
              <p style={{ margin: '8px 0 0', fontSize: 12, textAlign: 'center', color: '#8aa89e' }}>
                Isso se paga com apenas R$ 197 do que você já identificou.
              </p>
            </div>
          )}

          {plano === 'Gratuito' && valorRecuperavel === 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #dce8e2' }}>
              <button
                type="button"
                className="rg-btn rg-btn-primary"
                onClick={handleCheckout}
                disabled={loadingCheckout}
                style={{ width: '100%' }}
              >
                {loadingCheckout ? 'Processando...' : 'Assinar agora — R$ 197/mês'}
              </button>
              <p style={{ margin: '8px 0 0', fontSize: 12, textAlign: 'center', color: '#8aa89e' }}>
                Cancelamento a qualquer momento, sem multa.
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
              <input id="nome" className="rg-input" defaultValue={clinica.nome} />
            </Field>
            <Field id="cnpj" label="CNPJ" ajuda="Aparece nos recursos enviados à operadora">
              <input id="cnpj" className="rg-input" inputMode="numeric" defaultValue={clinica.cnpj} />
            </Field>
          </div>
          <div className="rg-row">
            <div className="rg-spacer" />
            <button
              type="button"
              className="rg-btn rg-btn-primary"
              disabled={salvando}
              onClick={() => {
                setSalvando(true);
                /* ⬛ PREENCHER: chamar mutation Supabase */
              }}
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
