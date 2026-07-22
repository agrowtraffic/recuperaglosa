'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const Icon = ({ name, size = 20, stroke = 1.8 }) => {
  const common = { width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true };
  const paths = {
    home:<><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    folder:<path d="M3 6h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>,
    file:<><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></>,
    alert:<><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></>,
    scale:<><path d="M12 3v18M5 7h14M7 7l-4 7h8zM17 7l-4 7h8z"/></>,
    chart:<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z"/></>,
    plus:<path d="M12 5v14M5 12h14"/>, bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chevron:<path d="m9 10 3 3 3-3"/>, upload:<><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    dollar:<><circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.7-.8-1.7-1.2-3-1.2-1.8 0-3 .9-3 2.3 0 3.4 6 1.6 6 5 0 1.4-1.2 2.4-3.2 2.4-1.4 0-2.5-.5-3.3-1.4M12 5v14"/></>,
    whatsapp:<><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8.7 8.2c.3 2.5 2.3 4.6 4.8 5.1"/></>,
    download:<><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/></>,
    copy:<><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    filter:<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>, eye:<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    check:<path d="m5 12 4 4L19 6"/>, x:<path d="M6 6l12 12M18 6 6 18"/>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    lock:<><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    credit:<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    menu:<><path d="M3 6h18M3 12h18M3 18h18"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
};

function Logo(){return <div className="logo"><img src="/logo-icon.png" alt="Recupera Glosa" className="logo-mark" style={{width:38,height:38}}/><div className="logo-word"><span>Recupera</span><b>Glosa</b></div></div>}

const nav=[['home','Visão geral'],['folder','Lotes'],['file','Guias'],['alert','Glosas'],['scale','Recursos'],['chart','Relatórios'],['settings','Configurações']];

// DADOS MOCK DO PROJETO A — mantenha este bloco fácil de localizar.
// TODO SUPABASE: substituir pelos resultados das tabelas lote, guia, item e recurso.
const lotes=[
  {arquivo:'demonstrativo_0425.xml',data:'12/05/2025 14:32',operadora:'Unimed',guias:78,glosas:12,valor:'R$ 4.350,20',valorNumero:4350.20,status:'Processado'},
  {arquivo:'demonstrativo_0325.xml',data:'08/05/2025 09:15',operadora:'Amil',guias:65,glosas:9,valor:'R$ 2.180,50',valorNumero:2180.50,status:'Processado'},
  {arquivo:'demonstrativo_0225.xml',data:'02/05/2025 16:48',operadora:'SulAmérica',guias:43,glosas:6,valor:'R$ 1.920,30',valorNumero:1920.30,status:'Processado'},
  {arquivo:'demonstrativo_0125.xml',data:'28/04/2025 11:20',operadora:'Bradesco',guias:52,glosas:8,valor:'R$ 3.120,40',valorNumero:3120.40,status:'Processado'},
  {arquivo:'demonstrativo_1224.xml',data:'15/04/2025 08:55',operadora:'Unimed',guias:91,glosas:7,valor:'R$ 2.860,15',valorNumero:2860.15,status:'Processado'}
];
const guias=[
  ['00038492','Maria de Souza','Unimed','Consulta','R$ 380,00','R$ 300,00','R$ 80,00'],
  ['00038475','Carlos Almeida','Amil','Procedimento','R$ 1.240,00','R$ 800,00','R$ 440,00'],
  ['00038440','Ana Costa','SulAmérica','Exame','R$ 720,00','R$ 540,00','R$ 180,00'],
  ['00038398','João Pereira','Bradesco','Consulta','R$ 450,00','R$ 350,00','R$ 100,00'],
  ['00038364','Patrícia Lima','Unimed','Cirurgia','R$ 3.800,00','R$ 2.600,00','R$ 1.200,00']
];
const glosas=[
  ['00038492','1019','Procedimento não coberto','R$ 80,00','Alta','Recorrível'],
  ['00038475','1302','Código incorreto','R$ 440,00','Alta','Recorrível'],
  ['00038440','1701','Documentação insuficiente','R$ 180,00','Média','Recorrível'],
  ['00038398','1008','Prazo de envio expirado','R$ 100,00','Baixa','Analisar'],
  ['00038364','1405','Valor acima da tabela','R$ 1.200,00','Alta','Recorrível']
];
const recursos=[
  ['REC-0425-012','Guia 00038492','Procedimento não coberto','R$ 80,00','Pronto'],
  ['REC-0425-009','Guia 00038475','Código incorreto','R$ 440,00','Pronto'],
  ['REC-0325-006','Guia 00038440','Documentação insuficiente','R$ 180,00','Enviado'],
  ['REC-0325-002','Guia 00038398','Prazo de envio expirado','R$ 100,00','Rascunho']
];
const evolucaoFinanceira=[
  {mes:'Dez',recuperavel:4200,recuperado:2100},{mes:'Jan',recuperavel:5800,recuperado:3300},
  {mes:'Fev',recuperavel:4900,recuperado:3900},{mes:'Mar',recuperavel:7600,recuperado:4800},
  {mes:'Abr',recuperavel:6800,recuperado:6100},{mes:'Mai',recuperavel:9180,recuperado:7420}
];
const motivosGlosa=[
  {name:'Procedimento não coberto',value:35,color:'#16A34A'},
  {name:'Código incorreto',value:28,color:'#006445'},
  {name:'Documentação insuficiente',value:18,color:'#F97316'},
  {name:'Outros',value:19,color:'#7185A6'}
];

export default function Page(){
 const router=useRouter();
 const [tab,setTab]=useState('Visão geral');
 const [upload,setUpload]=useState(false);
 const [query,setQuery]=useState('');
 const [dashboardData,setDashboardData]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState(null);
 const [authChecked,setAuthChecked]=useState(false);
 const [menuOpen,setMenuOpen]=useState(false);

 // Verificar autenticação
 useEffect(()=>{
   const checkAuth=async()=>{
     try{
       const supabase=createClient();
       const {data:{user}}=await supabase.auth.getUser();
       if(!user) router.push('/login');
       else setAuthChecked(true);
     }catch(e){
       console.error('Auth check error:',e);
       router.push('/login');
     }
   };
   checkAuth();
 },[router]);

 if(!authChecked) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>Carregando...</div>;

 useEffect(()=>{
   let cancelled=false;
   async function loadDashboard(){
     try{
       setError(null);
       const res=await fetch('/api/dashboard');
       if(!res.ok) throw new Error(`Erro ${res.status}`);
       const json=await res.json();
       if(!cancelled) setDashboardData(json);
     }catch(e){
       console.error('Dashboard error:',e);
       if(!cancelled) setError('Não foi possível carregar os dados, tente novamente');
     }finally{
       if(!cancelled) setLoading(false);
     }
   }
   loadDashboard();
   return ()=>{cancelled=true;};
 },[]);

 const title=tab;
 const sub={
  'Visão geral':'Acompanhe suas auditorias e valores recuperáveis',
  'Lotes':'Gerencie os demonstrativos enviados para auditoria',
  'Guias':'Consulte todas as guias identificadas nos demonstrativos',
  'Glosas':'Priorize valores glosados e oportunidades de recuperação',
  'Recursos':'Revise, copie e envie contestações prontas',
  'Relatórios':'Entenda a evolução financeira e os principais motivos',
  'Configurações':'Gerencie clínica, equipe, cobrança e segurança'
 }[tab];

 return <main className="app-shell full-app">
  <header className="topbar"><button className="menu-toggle" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Menu"><Icon name="menu"/></button><Logo/><div className="top-actions"><button className="icon-button" aria-label="Notificações"><Icon name="bell"/></button><button className="clinic"><span>C</span>Clínica Sorriso<Icon name="chevron" size={16}/></button></div></header>
  <div className="app-body"><aside className={`sidebar ${menuOpen?'mobile-open':''}`}><nav>{nav.map(([icon,label])=><button onClick={()=>{setTab(label);setQuery('');setMenuOpen(false)}} className={tab===label?'active':''} key={label}><Icon name={icon}/><span>{label}</span></button>)}</nav><div className="plan-card"><strong>Plano Profissional</strong><p>Próxima cobrança<br/><b>12/06/2025</b></p><button>Gerenciar plano</button></div><button className="whatsapp-mobile" onClick={()=>window.open('https://wa.me/5511999999999')}><Icon name="whatsapp"/>Falar no WhatsApp</button></aside>
  {menuOpen&&<div className="drawer-backdrop" onClick={()=>setMenuOpen(false)}/>}
  <section className="content"><div className="content-head"><div><h1>{title}</h1><p>{sub}</p></div>{tab!=='Configurações'&&<button className="primary" onClick={()=>setUpload(true)}><Icon name="plus"/>Novo upload</button>}</div>
   {tab==='Visão geral'&&<Overview setTab={setTab} dashboardData={dashboardData} error={error}/>} {tab==='Lotes'&&<Lotes query={query} setQuery={setQuery} dashboardData={dashboardData}/>} {tab==='Guias'&&<Guias/>} {tab==='Glosas'&&<Glosas/>} {tab==='Recursos'&&<Recursos/>} {tab==='Relatórios'&&<Relatorios/>} {tab==='Configurações'&&<Configuracoes/>}
  </section></div>{upload&&<UploadModal close={()=>setUpload(false)}/>}</main>
}

function Overview({setTab,dashboardData,error}){
 const kpis=dashboardData?.kpis||{valorRecuperavel:'R$ 0,00',lotesProcessados:0,guiasAuditadas:0};
 const lotesData=dashboardData?.lotes||[];
 const motivosReal=dashboardData?.motivos||[];

 const motivosFormatted=useMemo(()=>{
   if(!motivosReal||motivosReal.length===0) return [{name:'Sem dados',value:100,color:'#e5e7eb'}];
   const total=motivosReal.reduce((s,m)=>s+Number(m.total_glosado||0),0);
   return motivosReal.map(m=>({
     name:m.motivo_glosa||'Outro',
     value:total>0?Math.round((Number(m.total_glosado||0)/total)*100):0,
     color:['#16A34A','#006445','#F97316','#7185A6'][motivosReal.indexOf(m)%4]
   }));
 },[motivosReal]);

 return <div className="dashboard-grid">
 <div className="kpi recoverable"><p>Valor recuperável</p><strong>{kpis.valorRecuperavel}</strong><small>em {motivosReal.length} motivos</small><Spark/></div>
 <Kpi title="Lotes processados" value={String(kpis.lotesProcessados)} sub="últimos 30 dias" icon="file" tone="green"/>
 <Kpi title="Guias auditadas" value={String(kpis.guiasAuditadas)} sub="últimos 30 dias" icon="file" tone="blue"/>
 <div className="reasons card"><h2>Motivos mais recorrentes</h2><div className="reason-content"><Donut data={motivosFormatted}/><div className="legend">{motivosFormatted.map(item=><Legend key={item.name} color={item.color} t={item.name} v={`${item.value}%`}/>)}</div></div><button className="outline" onClick={()=>setTab('Relatórios')}>Ver relatório completo</button></div>
 <div className="lots card"><h2>Últimos lotes</h2>{lotesData.length===0?<p style={{color:'#999',padding:'1rem'}}>Nenhum lote enviado. Comece a auditoria clicando em "Novo upload"</p>:<SimpleTable heads={['Arquivo','Enviado em','Guias','Glosas','Valor recuperável','Status']} rows={lotesData.slice(0,3).map(x=>[x.arquivo,x.data,x.guias,x.glosas,x.valor,<Status key={x.arquivo} text={x.status}/>])}/> }<button className="outline small" onClick={()=>setTab('Lotes')}>Ver todos os lotes</button></div>
 <div className="help card"><h2>Precisa de ajuda?</h2><p>Fale com nosso time e tire suas dúvidas.</p><button className="outline whatsapp"><Icon name="whatsapp"/>Falar no WhatsApp</button></div>
 </div>}

function Lotes({query,setQuery,dashboardData}){
 const [operadora,setOperadora]=useState('Todas');
 const lotesData=dashboardData?.lotes||[];
 const filtered=useMemo(()=>lotesData.filter(x=>(x.arquivo.toLowerCase().includes(query.toLowerCase())||x.operadora.toLowerCase().includes(query.toLowerCase()))&&(operadora==='Todas'||x.operadora===operadora)),[query,operadora,lotesData]);
 const totalLotes=lotesData.length;
 const processados=lotesData.filter(l=>l.status==='Processado').length;
 const emProcessamento=totalLotes-processados;
 const totalValor=lotesData.reduce((s,l)=>{
   const num=parseFloat(l.valor?.replace(/[^\d,.-]/g,'').replace(',','.')||0);
   return s+num;
 },0);
 return <><Toolbar query={query} setQuery={setQuery} placeholder="Buscar arquivo ou operadora..."><SelectFilter value={operadora} onChange={setOperadora} options={['Todas','Unimed','Amil','SulAmérica','Bradesco']} label="Operadora"/></Toolbar><div className="metric-row"><Metric label="Total de lotes" value={String(totalLotes)}/><Metric label="Processados" value={String(processados)} positive/><Metric label="Em processamento" value={String(emProcessamento)}/><Metric label="Valor identificado" value={totalValor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} positive/></div><div className="page-card"><div className="card-title"><div><h2>Todos os lotes</h2><p>Demonstrativos XML enviados para análise</p></div><button className="outline compact"><Icon name="download"/>Exportar</button></div><DataTable heads={['Arquivo','Operadora','Enviado em','Guias','Glosas','Valor recuperável','Status','']} rows={filtered.map(x=>[<span className="with-icon" key="a"><Icon name="file" size={17}/>{x.arquivo}</span>,x.operadora,x.data,x.guias,x.glosas,<b className="money" key="m">{x.valor}</b>,<Status key="s" text={x.status}/>,<button className="row-action" aria-label={`Ver ${x.arquivo}`} key="r"><Icon name="eye" size={17}/></button>])}/></div></>}

function Guias(){
 const [query,setQuery]=useState('');
 const [operadora,setOperadora]=useState('Todas');
 const filtered=[];
 return <><Toolbar query={query} setQuery={setQuery} placeholder="Buscar guia, paciente ou operadora..."><SelectFilter value={operadora} onChange={setOperadora} options={['Todas','Unimed','Amil','SulAmérica','Bradesco']} label="Operadora"/></Toolbar><div className="metric-row"><Metric label="Guias auditadas" value="0"/><Metric label="Com glosa" value="0" warn/><Metric label="Sem glosa" value="0" positive/><Metric label="Taxa de aprovação" value="0%" positive/></div><div className="page-card"><div className="card-title"><div><h2>Guias auditadas</h2><p>Valores apresentados, pagos e glosados</p></div><button className="outline compact"><Icon name="download"/>Exportar</button></div><DataTable heads={['Nº da guia','Paciente','Operadora','Tipo','Apresentado','Pago','Glosado','']} rows={filtered}/></div></>}

function Glosas(){
 const [query,setQuery]=useState('');
 const [prioridade,setPrioridade]=useState('Todas');
 const filtered=[];
 return <><Toolbar query={query} setQuery={setQuery} placeholder="Buscar guia, codigo ou motivo..."><SelectFilter value={prioridade} onChange={setPrioridade} options={['Todas','Alta','Media','Baixa']} label="Prioridade"/></Toolbar><div className="metric-row"><Metric label="Total glosado" value="R$ 0,00" warn/><Metric label="Recorrivel" value="R$ 0,00" positive/><Metric label="Em analise" value="R$ 0,00"/><Metric label="Nao recorrivel" value="R$ 0,00"/></div><div className="split-layout"><div className="page-card"><div className="card-title"><div><h2>Glosas identificadas</h2><p>Ordenadas por potencial de recuperacao</p></div></div><DataTable heads={['Guia','Codigo','Motivo','Valor','Prioridade','Situacao']} rows={filtered}/></div><aside className="insight-card"><span className="insight-icon"><Icon name="dollar"/></span><h3>Maior oportunidade</h3><strong>R$ 0,00</strong><p>Nenhuma glosa encontrada. Envie um demonstrativo para comecar.</p><button className="primary full">Novo upload</button></aside></div></>}

function Recursos(){
 const [query,setQuery]=useState('');
 const [status,setStatus]=useState('Todos');
 const filtered=[];
 const columns=['Rascunho','Pronto','Enviado','Aceito'];
 return <><Toolbar query={query} setQuery={setQuery} placeholder="Buscar recurso, guia ou motivo..."><SelectFilter value={status} onChange={setStatus} options={['Todos','Rascunho','Pronto','Enviado','Aceito']} label="Status"/></Toolbar><div className="metric-row"><Metric label="Recursos prontos" value="0" positive/><Metric label="Enviados" value="0"/><Metric label="Aceitos" value="0" positive/><Metric label="Taxa de sucesso" value="0%" positive/></div>
 <div className="kanban" aria-label="Pipeline de recursos">{columns.map(column=><section className="kanban-column" key={column}><header><span>{column}</span><b>0</b></header><div className="kanban-empty">Nenhum recurso nesta etapa</div></section>)}</div>
 <div className="page-card resources-table"><div className="card-title"><div><h2>Todos os recursos</h2><p>Textos gerados automaticamente para contestação</p></div><button className="outline compact"><Icon name="download"/>Baixar todos</button></div><DataTable heads={['Recurso','Referência','Motivo','Valor','Status','Ações']} rows={filtered}/></div>
 <div className="resource-preview"><div><span className="eyebrow">PRÉVIA DO RECURSO</span><h3>Nenhum recurso disponível</h3><p>Quando glosas forem identificadas, recursos serão gerados automaticamente e aparecerão aqui para cópia e envio.</p></div><button className="primary" disabled><Icon name="copy"/>Copiar texto</button></div></>}

function Relatorios(){
 const [periodo,setPeriodo]=useState('30 dias');
 return <><div className="report-head"><div className="segmented">{['30 dias','3 meses','12 meses'].map(p=><button key={p} className={periodo===p?'active':''} onClick={()=>setPeriodo(p)}>Últimos {p}</button>)}</div><button className="outline compact"><Icon name="download"/>Exportar PDF</button></div><div className="metric-row"><Metric label="Valor apresentado" value="R$ 0,00"/><Metric label="Valor pago" value="R$ 0,00"/><Metric label="Valor glosado" value="R$ 0,00" warn/><Metric label="Recuperado" value="R$ 0,00" positive/></div><div className="report-grid"><div className="page-card chart-card"><div className="card-title"><div><h2>Evolução do valor recuperável</h2><p>Comparativo mensal — {periodo}</p></div></div><div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'#999'}}>Nenhum dado disponível</div></div><div className="page-card"><div className="card-title"><div><h2>Motivos de glosa</h2><p>Participação no valor total</p></div></div><div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'#999'}}>Nenhum dado disponível</div></div></div></>}

function Configuracoes(){const [section,setSection]=useState('Clínica');return <div className="settings-layout"><aside className="settings-nav">{[['user','Clínica'],['user','Equipe'],['credit','Assinatura'],['bell','Notificações'],['lock','Segurança']].map(([i,l])=><button className={section===l?'active':''} onClick={()=>setSection(l)} key={l}><Icon name={i}/>{l}</button>)}</aside><div className="page-card settings-card"><h2>{section}</h2><p className="settings-sub">Atualize as informações e preferências desta seção.</p>{section==='Clínica'&&<FormClinic/>}{section==='Equipe'&&<Team/>}{section==='Assinatura'&&<Billing/>}{section==='Notificações'&&<Notifications/>}{section==='Segurança'&&<Security/>}</div></div>}

function FormClinic(){return <form className="form-grid"><Field label="Nome da clínica" value="Clínica Sorriso"/><Field label="CNPJ" value="12.345.678/0001-90"/><Field label="E-mail financeiro" value="financeiro@clinicasorriso.com.br"/><Field label="Telefone" value="(11) 99999-0000"/><Field label="CNES" value="1234567"/><Field label="Cidade" value="São Paulo — SP"/><div className="form-actions"><button type="button" className="primary">Salvar alterações</button></div></form>}
function Team(){return <div><div className="team-row"><div className="avatar">HC</div><div><b>Henrique Costa</b><p>henrique@clinicasorriso.com.br</p></div><Status text="Administrador"/></div><div className="team-row"><div className="avatar">MS</div><div><b>Mariana Souza</b><p>mariana@clinicasorriso.com.br</p></div><Status text="Membro"/></div><button className="primary"><Icon name="plus"/>Convidar membro</button></div>}
function Billing(){return <div className="billing"><div className="billing-plan"><div><span className="eyebrow">PLANO ATUAL</span><h3>Profissional</h3><p>Auditorias ilimitadas e geração automática de recursos.</p></div><strong>R$ 197<small>/mês</small></strong></div><div className="billing-note"><Icon name="credit"/><div><b>Próxima cobrança em 12/06/2025</b><p>Cartão final 4242</p></div><button className="outline compact">Alterar cartão</button></div></div>}
function Notifications(){return <div className="toggle-list"><Toggle title="Auditoria concluída" sub="Receba um aviso quando um lote terminar de processar."/><Toggle title="Novo valor recuperável" sub="Aviso quando forem encontradas novas glosas recorríveis."/><Toggle title="Resumo semanal" sub="Receba toda segunda-feira um resumo financeiro."/></div>}
function Security(){return <div className="security"><div className="security-item"><Icon name="lock"/><div><b>Link mágico por e-mail</b><p>Seu acesso está protegido sem necessidade de senha.</p></div><Status text="Ativo"/></div><button className="outline compact">Encerrar outras sessões</button></div>}

function UploadModal({close}){
 const [file,setFile]=useState(null);
 return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="upload-title"><button className="modal-x" onClick={close} aria-label="Fechar"><Icon name="x"/></button><span className="upload-symbol"><Icon name="upload" size={30}/></span><h2 id="upload-title">Enviar demonstrativo</h2><p>Selecione um arquivo XML no padrão TISS para iniciar a auditoria.</p><label className={`dropzone ${file?'has-file':''}`}><Icon name={file?'check':'upload'} size={28}/><b>{file?file.name:'Arraste o XML para cá'}</b><span>{file?'Arquivo pronto para auditoria':'ou clique para selecionar o arquivo'}</span><input type="file" accept=".xml" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><div className="modal-actions"><button className="outline" onClick={close}>Cancelar</button><button className="primary" disabled={!file}>Analisar arquivo</button></div></div></div>}

function Toolbar({query='',setQuery=()=>{},placeholder,children}){return <div className="toolbar"><label><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={placeholder}/>{query&&<button type="button" className="clear-search" onClick={()=>setQuery('')} aria-label="Limpar busca"><Icon name="x" size={14}/></button>}</label><div className="toolbar-actions">{children}<button className="outline compact"><Icon name="filter"/>Filtros</button></div></div>}
function SelectFilter({value,onChange,options,label}){return <label className="select-filter"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(option=><option key={option}>{option}</option>)}</select><Icon name="chevron" size={14}/></label>}
function Metric({label,value,positive,warn}){return <div className="metric-card"><p>{label}</p><strong className={positive?'positive':warn?'warn':''}>{value}</strong><small>últimos 30 dias</small></div>}
function Kpi({title,value,sub,icon,tone}){return <div className="kpi"><p>{title}</p><strong className="dark">{value}</strong><small>{sub}</small><span className={`kpi-icon ${tone}`}><Icon name={icon}/></span></div>}

function ChartTooltip({active,payload,label}){if(!active||!payload?.length)return null;return <div className="chart-tooltip">{label&&<strong>{label}</strong>}{payload.map(item=><span key={item.dataKey||item.name} style={{color:item.color||item.payload?.color}}>{item.name}: {typeof item.value==='number'?item.value.toLocaleString('pt-BR'):item.value}</span>)}</div>}
function Spark(){return <div className="spark-chart" aria-label="Evolução do valor recuperável"><ResponsiveContainer width="100%" height="100%"><AreaChart data={evolucaoFinanceira} margin={{top:5,right:2,left:2,bottom:2}}><defs><linearGradient id="sparkFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity=".25"/><stop offset="100%" stopColor="#16A34A" stopOpacity="0"/></linearGradient></defs><Tooltip content={<ChartTooltip/>}/><Area type="monotone" dataKey="recuperavel" name="Recuperável" stroke="#16A34A" strokeWidth={2.3} fill="url(#sparkFade)" dot={false} activeDot={{r:4}}/></AreaChart></ResponsiveContainer></div>}
function Donut({data,large=false}){return <div className={`recharts-donut ${large?'is-large':''}`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={large?54:28} outerRadius={large?78:42} paddingAngle={1} stroke="#fff" strokeWidth={2}>{data.map(item=><Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip formatter={(value,name)=>[`${value}%`,name]} contentStyle={{border:'1px solid #e2e8f0',borderRadius:10,fontSize:11,boxShadow:'0 12px 30px rgba(15,23,42,.1)'}}/></PieChart></ResponsiveContainer>{large&&<div className="donut-label"><strong>100%</strong><span>das glosas</span></div>}</div>}
function Legend({color,t,v}){return <div className="legend-row"><span className="dot" style={{background:color}}/><p>{t}</p><b>{v}</b></div>}
function Status({text}){const cls=text.toLowerCase().replaceAll(' ','-').normalize('NFD').replace(/[\u0300-\u036f]/g,'');return <em className={`status ${cls}`}>{text}</em>}
function Priority({text}){return <span className={`priority ${text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}`}>{text}</span>}
function SimpleTable({heads,rows}){return <div className="simple-table"><div className="simple-row head">{heads.map(h=><span key={h}>{h}</span>)}</div>{rows.map((r,i)=><div className="simple-row" key={i}>{r.map((v,j)=><span key={j}>{v}</span>)}</div>)}</div>}
function DataTable({heads,rows,pageSize=5}){const [page,setPage]=useState(1);const pages=Math.max(1,Math.ceil(rows.length/pageSize));const current=Math.min(page,pages);const visible=rows.slice((current-1)*pageSize,current*pageSize);return <><div className="data-table-wrap"><table className="data-table"><thead><tr>{heads.map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{visible.length?visible.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>):<tr><td colSpan={heads.length}><div className="empty-table"><Icon name="search"/><strong>Nenhum resultado encontrado</strong><span>Ajuste a busca ou os filtros.</span></div></td></tr>}</tbody></table></div><div className="pagination"><span>Mostrando {visible.length} de {rows.length} registros</span><div><button disabled={current===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>‹</button>{Array.from({length:pages},(_,i)=>i+1).map(p=><button className={p===current?'active':''} onClick={()=>setPage(p)} key={p}>{p}</button>)}<button disabled={current===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>›</button></div></div></>}
function BarChart(){return <div className="real-bar-chart"><ResponsiveContainer width="100%" height="100%"><RechartsBarChart data={evolucaoFinanceira} margin={{top:18,right:12,left:0,bottom:0}} barGap={4}><CartesianGrid vertical={false} stroke="#EEF2F6"/><XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill:'#64748B',fontSize:10}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#64748B',fontSize:10}} tickFormatter={v=>`R$ ${v/1000}k`}/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="recuperavel" name="Recuperável" fill="#16A34A" radius={[5,5,0,0]}/><Bar dataKey="recuperado" name="Recuperado" fill="#0F3F82" radius={[5,5,0,0]}/></RechartsBarChart></ResponsiveContainer></div>}
function Field({label,value}){return <label className="field"><span>{label}</span><input defaultValue={value}/></label>}
function Toggle({title,sub}){const [on,setOn]=useState(true);return <div className="toggle-row"><div><b>{title}</b><p>{sub}</p></div><button type="button" aria-pressed={on} aria-label={`${on?'Desativar':'Ativar'} ${title}`} onClick={()=>setOn(!on)} className={`toggle ${on?'on':''}`}><span/></button></div>}
