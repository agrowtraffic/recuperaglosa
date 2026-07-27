'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '../_components/Icon';
import { Toolbar, SelectFilter, Metric, DataTable } from '../_components/ui';

export default function RecursosPage(){
 const router = useRouter();
 const [query,setQuery]=useState('');
 const [status,setStatus]=useState('Todos');
 const [clinica,setClinica]=useState(null);
 const [loading,setLoading]=useState(true);
 const [checkoutLoading,setCheckoutLoading]=useState(false);
 const filtered=[];
 const columns=['Rascunho','Pronto','Enviado','Aceito'];

 useEffect(()=>{
   let cancelled=false;
   fetch('/api/dashboard')
     .then(res=>{
       if(res.status === 404) {
         router.replace('/completar-cadastro');
         return null;
       }
       return res.ok?res.json():null;
     })
     .then(json=>{ if(!cancelled && json) setClinica(json?.clinica||null); })
     .catch(()=>{})
     .finally(()=>{ if(!cancelled) setLoading(false); });
   return ()=>{cancelled=true;};
 },[router]);

 const isAssinante = clinica?.plano==='ativo';

 async function handleCheckout(){
   setCheckoutLoading(true);
   try{
     const res=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});
     const data=await res.json();
     if(data.checkoutUrl) window.location.href=data.checkoutUrl;
   }catch(e){
     console.error('Erro no checkout:',e);
   }finally{
     setCheckoutLoading(false);
   }
 }

 return <>
  <div className="content-head"><div><h1>Recursos</h1><p>Revise, copie e envie contestações prontas</p></div><Link href="/upload" className="primary"><Icon name="plus"/>Novo upload</Link></div>
  {!loading && !isAssinante && (
   <div style={{padding:'14px 16px',background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:8,marginBottom:20,color:'#92400e',fontSize:13,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
    <span>🔒 <strong>Plano grátis</strong> — recursos com prévia. Assine para desbloquear o texto completo.</span>
    <button className="primary compact" onClick={handleCheckout} disabled={checkoutLoading}>{checkoutLoading?'Abrindo...':'Assinar agora'}</button>
   </div>
  )}
  <Toolbar query={query} setQuery={setQuery} placeholder="Buscar recurso, guia ou motivo..."><SelectFilter value={status} onChange={setStatus} options={['Todos','Rascunho','Pronto','Enviado','Aceito']} label="Status"/></Toolbar>
  <div className="metric-row"><Metric label="Recursos prontos" value="0" positive/><Metric label="Enviados" value="0"/><Metric label="Aceitos" value="0" positive/><Metric label="Taxa de sucesso" value="0%" positive/></div>
  <div className="kanban" aria-label="Pipeline de recursos">{columns.map(column=><section className="kanban-column" key={column}><header><span>{column}</span><b>0</b></header><div className="kanban-empty">Nenhum recurso nesta etapa</div></section>)}</div>
  <div className="page-card resources-table"><div className="card-title"><div><h2>Todos os recursos</h2><p>Textos gerados automaticamente para contestação</p></div><button className="outline compact" disabled title="Em breve — disponível quando houver recursos gerados"><Icon name="download"/>Baixar todos</button></div><DataTable heads={['Recurso','Referência','Motivo','Valor','Status','Ações']} rows={filtered}/></div>
  <div className="resource-preview"><div><span className="eyebrow">PRÉVIA DO RECURSO</span><h3>Nenhum recurso disponível</h3><p>Quando glosas forem identificadas, recursos serão gerados automaticamente e aparecerão aqui para cópia e envio.</p></div><button className="primary" disabled><Icon name="copy"/>Copiar texto</button></div>
 </>;
}
