/* ============================================================
   CONFIGURAÇÕES  →  app/(app)/configuracoes/page.jsx
   Navegação por seções: abas no desktop, lista no celular.
   Botão desabilitado sempre diz por quê.
   ============================================================ */
import { PageHeader, Field } from "@/app/_components/kit/Primitives";

export default function Configuracoes() {
  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Configurações" titulo="A base da sua clínica"
        descricao="Dados, plano e equipe em um só lugar." />

      <section className="rg-card">
        <div className="rg-card-head"><h2 className="rg-h2">Dados da clínica</h2></div>
        <div className="rg-card-pad rg-stack">
          <div className="rg-grid-half">
            <Field id="nome" label="Nome da clínica">
              <input id="nome" className="rg-input" defaultValue={"" /* ⬛ PREENCHER */} />
            </Field>
            <Field id="cnpj" label="CNPJ" ajuda="Aparece nos recursos enviados à operadora">
              <input id="cnpj" className="rg-input" inputMode="numeric" defaultValue={"" /* ⬛ */} />
            </Field>
          </div>
          <div className="rg-row">
            <div className="rg-spacer" />
            <button className="rg-btn rg-btn-primary">Salvar alterações</button>
          </div>
        </div>
      </section>

      <section className="rg-card">
        <div className="rg-card-head"><h2 className="rg-h2">Plano e cobrança</h2></div>
        <div className="rg-card-pad rg-stack">
          <div className="rg-row rg-row-wrap">
            <div>
              <p className="rg-eyebrow">Plano atual</p>
              <strong style={{ fontSize: 16 }}>{"⬛ Gratuito"}</strong>
            </div>
            <div className="rg-spacer" />
            {/* ⬛ PREENCHER: portal Stripe já implementado */}
            <button className="rg-btn rg-btn-secondary">Gerenciar assinatura</button>
          </div>
          <p className="rg-caption">Cancelamento a qualquer momento, sem multa.</p>
        </div>
      </section>

      <section className="rg-card">
        <div className="rg-card-head"><h2 className="rg-h2">Equipe</h2></div>
        <div className="rg-card-pad rg-stack">
          {/* ⬛ PREENCHER: lista de membros */}
          <button className="rg-btn rg-btn-secondary" disabled title="Em breve">Convidar pessoa</button>
          <p className="rg-caption">Convite de equipe chega em breve. Hoje o acesso é individual por clínica.</p>
        </div>
      </section>
    </main>
  );
}
