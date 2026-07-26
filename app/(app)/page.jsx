'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from './_components/Icon';
import { Kpi, Donut, Legend, SimpleTable, Status, Spark } from './_components/ui';

const WHATSAPP_NUMBER = '5511977315655';

export default function OverviewPage(){
 const [dashboardData,setDashboardData]=useState(null);
 const [error,setError]=useState(null);

 useEffect(()=>{
   let cancelled=false;
   async function load(){
     try{
       setError(null);
       const res=await fetch('/api/dashboard');
       if(!res.ok) throw new Error(`Erro ${res.status}`);
       const json=await res.json();
       if(!cancelled) setDashboardData(json);
     }catch(e){
       console.error('Dashboard error:',e);
       if(!cancelled) setError('Não foi possível carregar os dados, tente novamente');
     }
   }
   load();
   return ()=>{cancelled=true;};
 },[]);

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

 return <>
  <div className="content-head"><div><h1>Visão geral</h1><p>Acompanhe suas auditorias e valores recuperáveis</p></div><Link href="/upload" className="primary"><Icon name="plus"/>Novo upload</Link></div>
  {error&&<p style={{color:'#dc2626',marginBottom:16}}>{error}</p>}
  <div className="dashboard-grid">
  <div className="kpi recoverable"><p>Valor recuperável</p><strong>{kpis.valorRecuperavel}</strong><small>em {motivosReal.length} motivos</small>{motivosReal.length > 0 && <Spark data={motivosReal}/>}</div>
  <Kpi title="Lotes processados" value={String(kpis.lotesProcessados)} sub="últimos 30 dias" icon="file" tone="green"/>
  <Kpi title="Guias auditadas" value={String(kpis.guiasAuditadas)} sub="últimos 30 dias" icon="file" tone="blue"/>
  <div className="reasons card"><h2>Motivos mais recorrentes</h2><div className="reason-content"><Donut data={motivosFormatted}/><div className="legend">{motivosFormatted.map(item=><Legend key={item.name} color={item.color} t={item.name} v={`${item.value}%`}/>)}</div></div><Link href="/relatorios" className="outline">Ver relatório completo</Link></div>
  <div className="lots card"><h2>Últimos lotes</h2>{lotesData.length===0?<p style={{color:'#999',padding:'1rem'}}>Nenhum lote enviado. Comece a auditoria clicando em "Novo upload"</p>:<SimpleTable heads={['Arquivo','Enviado em','Guias','Glosas','Valor recuperável','Status']} rows={lotesData.slice(0,3).map(x=>[x.arquivo,x.data,x.guias,x.glosas,x.valor,<Status key={x.arquivo} text={x.status}/>])}/> }<Link href="/lotes" className="outline small">Ver todos os lotes</Link></div>
  <div className="help card"><h2>Precisa de ajuda?</h2><p>Fale com nosso time e tire suas dúvidas.</p><button className="outline whatsapp" onClick={()=>window.open(`https://wa.me/${WHATSAPP_NUMBER}`)}><Icon name="whatsapp"/>Falar no WhatsApp</button></div>
  </div>
 </>;
}
