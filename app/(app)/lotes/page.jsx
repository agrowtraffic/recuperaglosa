'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '../_components/Icon';
import { Toolbar, SelectFilter, Metric, DataTable, Status } from '../_components/ui';

export default function LotesPage(){
 const [dashboardData,setDashboardData]=useState(null);
 const [error,setError]=useState(null);
 const [query,setQuery]=useState('');
 const [operadora,setOperadora]=useState('Todas');

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

 const lotesData=dashboardData?.lotes||[];
 const filtered=useMemo(()=>lotesData.filter(x=>(x.arquivo.toLowerCase().includes(query.toLowerCase())||x.operadora.toLowerCase().includes(query.toLowerCase()))&&(operadora==='Todas'||x.operadora===operadora)),[query,operadora,lotesData]);
 const totalLotes=lotesData.length;
 const processados=lotesData.filter(l=>l.status==='Processado').length;
 const emProcessamento=totalLotes-processados;
 const totalValor=lotesData.reduce((s,l)=>{
   const num=parseFloat(l.valor?.replace(/[^\d,.-]/g,'').replace(',','.')||0);
   return s+num;
 },0);

 return <>
  <div className="content-head"><div><h1>Lotes</h1><p>Gerencie os demonstrativos enviados para auditoria</p></div><Link href="/upload" className="primary"><Icon name="plus"/>Novo upload</Link></div>
  {error&&<p style={{color:'#dc2626',marginBottom:16}}>{error}</p>}
  <Toolbar query={query} setQuery={setQuery} placeholder="Buscar arquivo ou operadora..."><SelectFilter value={operadora} onChange={setOperadora} options={['Todas','Unimed','Amil','SulAmérica','Bradesco']} label="Operadora"/></Toolbar>
  <div className="metric-row"><Metric label="Total de lotes" value={String(totalLotes)}/><Metric label="Processados" value={String(processados)} positive/><Metric label="Em processamento" value={String(emProcessamento)}/><Metric label="Valor identificado" value={totalValor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} positive/></div>
  <div className="page-card"><div className="card-title"><div><h2>Todos os lotes</h2><p>Demonstrativos XML enviados para análise</p></div><button className="outline compact" disabled title="Em breve"><Icon name="download"/>Exportar</button></div><DataTable heads={['Arquivo','Operadora','Enviado em','Guias','Glosas','Valor recuperável','Status','']} rows={filtered.map(x=>[<span className="with-icon" key="a"><Icon name="file" size={17}/>{x.arquivo}</span>,x.operadora,x.data,x.guias,x.glosas,<b className="money" key="m">{x.valor}</b>,<Status key="s" text={x.status}/>,<button className="row-action" aria-label={`Ver ${x.arquivo}`} disabled title="Detalhe do lote em breve" key="r"><Icon name="eye" size={17}/></button>])}/></div>
 </>;
}
