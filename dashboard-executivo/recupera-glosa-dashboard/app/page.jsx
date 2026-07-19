const Icon = ({ name, size = 20, stroke = 1.8 }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    folder: <><path d="M3 6h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></>,
    file: <><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></>,
    alert: <><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></>,
    scale: <><path d="M12 3v18M5 7h14M7 7l-4 7h8zM17 7l-4 7h8z"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.2.37.55.74 1 .98.34.18.72.3 1.1.3h.1v4h-.1a1.7 1.7 0 0 0-1.1.4c-.44.32-.8.7-1 1.32Z"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chevron: <path d="m9 10 3 3 3-3"/>,
    document: <><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    dollar: <><circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.7-.8-1.7-1.2-3-1.2-1.8 0-3 .9-3 2.3 0 3.4 6 1.6 6 5 0 1.4-1.2 2.4-3.2 2.4-1.4 0-2.5-.5-3.3-1.4M12 5v14"/></>,
    shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z"/><path d="m9 12 2 2 4-4"/></>,
    whatsapp: <><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8.7 8.2c.3 2.5 2.3 4.6 4.8 5.1"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
};

function Logo({ large = false }) {
  return (
    <div className={large ? 'logo logo-large' : 'logo'}>
      <svg className="logo-mark" viewBox="0 0 72 72" aria-label="Marca RecuperaGlosa">
        <defs><linearGradient id={large ? 'lg2' : 'lg1'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#12b75a"/><stop offset="1" stopColor="#079246"/></linearGradient></defs>
        <path d="M15 61V37h10v24H15Zm14 0V28h10v33H29Zm14 0V18h10v43H43Z" fill={`url(#${large ? 'lg2' : 'lg1'})`}/>
        <path d="M13 12h31c11 0 18 6 18 16 0 8-5 13-12 15l12 17H48L37 44h-8V32h14c5 0 8-2 8-6s-3-6-8-6H25v9L10 16 25 3v9H13Z" fill={`url(#${large ? 'lg2' : 'lg1'})`}/>
      </svg>
      <div className="logo-word"><span>Recupera</span><b>Glosa</b></div>
    </div>
  );
}

const nav = [
  ['home','Visão geral'], ['folder','Lotes'], ['file','Guias'], ['alert','Glosas'], ['scale','Recursos'], ['chart','Relatórios'], ['settings','Configurações']
];

function Donut() {
  return <div className="donut" aria-label="Gráfico de motivos"><div /></div>;
}

const rows = [
  ['demonstrativo_0425.xml','12/05/2025 14:32','78','12','R$ 4.350,20'],
  ['demonstrativo_0325.xml','08/05/2025 09:15','65','9','R$ 2.180,50'],
  ['demonstrativo_0225.xml','02/05/2025 16:48','43','6','R$ 1.920,30']
];

export default function Page() {
  return (
    <main className="showcase">
      <aside className="brand-board">
        <div className="brand-inner">
          <Logo large />
          <p className="tagline">Recupere cada real glosado.</p>
          <Section title="CONCEITO">
            <div className="concept-grid">
              <p>Transformamos glosas em receita para clínicas e consultórios.<br/>Auditoria automática, cálculo preciso e recursos prontos para contestação.</p>
              <div className="concept-icons">
                <Mini icon="dollar" title="Dinheiro" sub="recuperado"/>
                <Mini icon="shield" title="Confiança" sub="e segurança"/>
                <Mini icon="chart" title="Resultado" sub="que cresce"/>
              </div>
            </div>
          </Section>
          <Section title="PALETA DE CORES">
            <div className="swatches">
              {[['#16A34A','green'],['#0F172A','navy'],['#F1F5F9','mist'],['#F8FAFC','white'],['#F97316','orange']].map(([hex,c])=><div key={hex}><span className={`swatch ${c}`}/><small>{hex}</small></div>)}
            </div>
          </Section>
          <Section title="TIPOGRAFIA">
            <div className="type-row"><div className="aa">Aa</div><div><strong>Manrope</strong><div className="weights"><span>Regular</span><span>Medium</span><span>Semibold</span><b>Bold</b></div></div></div>
          </Section>
          <Section>
            <div className="bottom-grid">
              <div><h3>ÍCONE</h3><div className="icon-tile"><LogoMark /></div></div>
              <div><h3>APLICAÇÕES</h3><div className="apps"><App icon="upload" label="Upload"/><App icon="search" label="Auditoria"/><App icon="dollar" label="Recuperação"/><App icon="file" label="Recurso"/></div></div>
            </div>
          </Section>
          <div className="promise"><div className="shield-box"><Icon name="shield" size={38}/></div><div><strong>Sua clínica cuida de pessoas.</strong><b>A gente cuida do seu dinheiro.</b></div></div>
        </div>
      </aside>

      <section className="app-shell">
        <header className="topbar">
          <Logo />
          <div className="top-actions"><button className="icon-button"><Icon name="bell"/></button><button className="clinic"><span>C</span>Clínica Sorriso<Icon name="chevron" size={16}/></button></div>
        </header>
        <div className="app-body">
          <aside className="sidebar">
            <nav>{nav.map(([icon,label],i)=><button className={i===0?'active':''} key={label}><Icon name={icon}/><span>{label}</span></button>)}</nav>
            <div className="plan-card"><strong>Plano Profissional</strong><p>Próxima cobrança<br/><b>12/06/2025</b></p><button>Gerenciar plano</button></div>
          </aside>
          <section className="content">
            <div className="content-head"><div><h1>Visão geral</h1><p>Acompanhe suas auditorias e valores recuperáveis</p></div><button className="primary"><Icon name="plus"/>Novo upload</button></div>
            <div className="dashboard-grid">
              <div className="kpi recoverable"><p>Valor recuperável</p><strong>R$ 18.430,75</strong><small>em 42 glosas</small><svg viewBox="0 0 200 76" className="spark"><defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#16A34A" stopOpacity=".24"/><stop offset="1" stopColor="#16A34A" stopOpacity="0"/></linearGradient></defs><path className="area" d="M4 63 L18 57 L30 59 L43 48 L56 52 L69 43 L82 46 L94 36 L106 39 L118 30 L130 34 L143 22 L156 25 L169 13 L184 17 L196 5 L196 75 L4 75Z"/><path d="M4 63 L18 57 L30 59 L43 48 L56 52 L69 43 L82 46 L94 36 L106 39 L118 30 L130 34 L143 22 L156 25 L169 13 L184 17 L196 5"/><circle cx="196" cy="5" r="4"/></svg></div>
              <Kpi title="Lotes processados" value="15" sub="últimos 30 dias" icon="document" tone="green"/>
              <Kpi title="Guias auditadas" value="342" sub="últimos 30 dias" icon="document" tone="blue"/>
              <div className="reasons card"><h2>Motivos mais recorrentes</h2><div className="reason-content"><Donut/><div className="legend"><Legend c="green" t="Procedimento não coberto" v="35%"/><Legend c="teal" t="Código incorreto" v="28%"/><Legend c="orange" t="Documentação insuficiente" v="18%"/><Legend c="slate" t="Outros" v="19%"/></div></div><button className="outline">Ver relatório completo</button></div>
              <div className="lots card"><h2>Últimos lotes</h2><div className="table"><div className="tr th"><span>Arquivo</span><span>Enviado em</span><span>Guias</span><span>Glosas</span><span>Valor recuperável</span><span>Status</span></div>{rows.map((r)=><div className="tr" key={r[0]}><span className="file-name"><Icon name="file" size={17}/>{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span><span>{r[3]}</span><span>{r[4]}</span><span><em>Processado</em><b className="dots">⋮</b></span></div>)}</div><button className="outline small">Ver todos os lotes</button></div>
              <div className="help card"><h2>Precisa de ajuda?</h2><p>Fale com nosso time e tire suas dúvidas.</p><button className="outline whatsapp"><Icon name="whatsapp"/>Falar no WhatsApp</button></div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function LogoMark(){return <svg className="logo-mark-only" viewBox="0 0 72 72"><path d="M15 61V37h10v24H15Zm14 0V28h10v33H29Zm14 0V18h10v43H43Z"/><path d="M13 12h31c11 0 18 6 18 16 0 8-5 13-12 15l12 17H48L37 44h-8V32h14c5 0 8-2 8-6s-3-6-8-6H25v9L10 16 25 3v9H13Z"/></svg>}
function Section({title,children}){return <section className="brand-section">{title&&<h3>{title}</h3>}{children}</section>}
function Mini({icon,title,sub}){return <div className="mini"><span><Icon name={icon} size={25}/></span><b>{title}</b><small>{sub}</small></div>}
function App({icon,label}){return <div className="app-icon"><span><Icon name={icon}/></span><small>{label}</small></div>}
function Kpi({title,value,sub,icon,tone}){return <div className="kpi"><p>{title}</p><strong className="dark">{value}</strong><small>{sub}</small><span className={`kpi-icon ${tone}`}><Icon name={icon}/></span></div>}
function Legend({c,t,v}){return <div className="legend-row"><span className={`dot ${c}`}/><p>{t}</p><b>{v}</b></div>}
