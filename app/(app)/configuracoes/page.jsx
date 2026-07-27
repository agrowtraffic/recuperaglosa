'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../_components/Icon';
import { Status, Field, Toggle } from '../_components/ui';
import { atualizarClinica } from './actions';
import { validarCNPJ } from '@/lib/validacao-cnpj';

export default function ConfiguracoesPage(){
 const [section,setSection]=useState('Clínica');
 const [clinica,setClinica]=useState(null);
 const [loading,setLoading]=useState(true);

 useEffect(()=>{
   let cancelled=false;
   fetch('/api/dashboard')
     .then(res=>res.ok?res.json():null)
     .then(json=>{ if(!cancelled) setClinica(json?.clinica||null); })
     .catch(()=>{})
     .finally(()=>{ if(!cancelled) setLoading(false); });
   return ()=>{cancelled=true;};
 },[]);

 return <>
  <div className="content-head"><div><h1>Configurações</h1><p>Gerencie clínica, equipe, cobrança e segurança</p></div></div>
  <div className="settings-layout">
   <aside className="settings-nav">{[['user','Clínica'],['user','Equipe'],['credit','Assinatura'],['bell','Notificações'],['lock','Segurança']].map(([i,l])=><button className={section===l?'active':''} onClick={()=>setSection(l)} key={l}><Icon name={i}/>{l}</button>)}</aside>
   <div className="page-card settings-card">
    <h2>{section}</h2>
    <p className="settings-sub">Atualize as informações e preferências desta seção.</p>
    {section==='Clínica'&&<FormClinic clinica={clinica} loading={loading}/>}
    {section==='Equipe'&&<Team/>}
    {section==='Assinatura'&&<Billing clinica={clinica} loading={loading}/>}
    {section==='Notificações'&&<Notifications/>}
    {section==='Segurança'&&<Security/>}
   </div>
  </div>
 </>;
}

// TODO backend: e-mail financeiro, telefone, CNES e cidade não têm coluna
// na tabela clinica ainda — ficam vazios até essas colunas existirem.
function FormClinic({clinica,loading}){
 const [nome,setNome]=useState('');
 const [cnpj,setCnpj]=useState('');
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState({type:'',text:''});
 const [cnpjError,setCnpjError]=useState('');

 useEffect(()=>{
   if(clinica){
     setNome(clinica.nome||'');
     setCnpj(clinica.cnpj||'');
   }
 },[clinica]);

 async function handleSubmit(e){
   e.preventDefault();
   setMessage({type:'',text:''});
   setCnpjError('');

   if(!nome.trim() || nome.trim().length < 2){
     setMessage({type:'error',text:'Nome deve ter pelo menos 2 caracteres'});
     return;
   }

   if(!validarCNPJ(cnpj)){
     setCnpjError('CNPJ inválido (deve ter 14 dígitos ou estar em branco)');
     return;
   }

   setSaving(true);
   try{
     const formData=new FormData();
     formData.append('nome',nome.trim());
     formData.append('cnpj',cnpj.trim());
     const result=await atualizarClinica(formData);
     if(result.error){
       setMessage({type:'error',text:result.error});
     }else{
       setMessage({type:'success',text:'Alterações salvas com sucesso!'});
       setNome(result.nome);
       setCnpj(result.cnpj||'');
     }
   }catch(e){
     console.error('Erro:',e);
     setMessage({type:'error',text:'Erro ao salvar alterações'});
   }finally{
     setSaving(false);
   }
 }

 if(loading) return <p style={{color:'#94a3b8'}}>Carregando dados da clínica...</p>;

 return <form onSubmit={handleSubmit} className="form-grid">
  <div>
   <label style={{display:'flex',flexDirection:'column',gap:6}}>
    <span style={{fontWeight:500,color:'#334155',fontSize:14}}>Nome da clínica</span>
    <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome da clínica" required
     style={{padding:'10px 12px',border:'1px solid #cbd5e1',borderRadius:8,fontSize:14,fontFamily:'inherit'}}/>
   </label>
  </div>
  <div>
   <label style={{display:'flex',flexDirection:'column',gap:6}}>
    <span style={{fontWeight:500,color:'#334155',fontSize:14}}>CNPJ</span>
    <input value={cnpj} onChange={e=>{setCnpj(e.target.value);setCnpjError('');}} placeholder="00.000.000/0000-00"
     style={{padding:'10px 12px',border:cnpjError?'1px solid #dc2626':'1px solid #cbd5e1',borderRadius:8,fontSize:14,fontFamily:'inherit'}}/>
    {cnpjError && <p style={{color:'#dc2626',fontSize:12,margin:'4px 0 0'}}>{cnpjError}</p>}
   </label>
  </div>
  <Field label="E-mail financeiro" placeholder="Ainda não configurável"/>
  <Field label="Telefone" placeholder="Ainda não configurável"/>
  <Field label="CNES" placeholder="Ainda não configurável"/>
  <Field label="Cidade" placeholder="Ainda não configurável"/>
  {message.text && (
   <p style={{color:message.type==='error'?'#dc2626':'#16a34a',fontSize:14,padding:'12px',background:message.type==='error'?'#fee2e2':'#f0fdf4',borderRadius:8}}>
    {message.text}
   </p>
  )}
  <div className="form-actions"><button type="submit" disabled={saving || loading} style={{opacity:saving||loading?0.6:1,cursor:saving||loading?'not-allowed':'pointer'}}>
   {saving?'Salvando...':'Salvar alterações'}
  </button></div>
 </form>;
}

// TODO backend: convites/membros de equipe ainda não existem no schema — dados de exemplo até existir a tabela.
function Team(){return <div><div className="team-row"><div className="avatar">HC</div><div><b>Henrique Costa</b><p>henrique@clinicasorriso.com.br</p></div><Status text="Administrador"/></div><div className="team-row"><div className="avatar">MS</div><div><b>Mariana Souza</b><p>mariana@clinicasorriso.com.br</p></div><Status text="Membro"/></div><button className="primary" disabled title="Em breve"><Icon name="plus"/>Convidar membro</button></div>}

function Billing({clinica,loading}){
 const [checkoutLoading,setCheckoutLoading]=useState(false);
 const [portalLoading,setPortalLoading]=useState(false);
 const [actionError,setActionError]=useState('');

 if(loading) return <div className="billing"><p style={{color:'#94a3b8'}}>Carregando informações do plano...</p></div>;
 const ativo=clinica?.plano==='ativo';

 async function handleCheckout(){
  setActionError('');
  setCheckoutLoading(true);
  try{
   const res=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});
   const data=await res.json();
   if(data.checkoutUrl) window.location.href=data.checkoutUrl;
   else setActionError('Não foi possível abrir o checkout.');
  }catch(e){
   console.error('Erro no checkout:',e);
   setActionError('Não foi possível abrir o checkout.');
  }finally{
   setCheckoutLoading(false);
  }
 }

 async function handlePortal(){
  setActionError('');
  setPortalLoading(true);
  try{
   const res=await fetch('/api/billing-portal',{method:'POST'});
   const data=await res.json();
   if(data.portalUrl) window.location.href=data.portalUrl;
   else setActionError('Não foi possível abrir o portal de cobrança.');
  }catch(e){
   console.error('Erro no portal:',e);
   setActionError('Não foi possível abrir o portal de cobrança.');
  }finally{
   setPortalLoading(false);
  }
 }

 return <div className="billing">
  <div className="billing-plan">
   <div>
    <span className="eyebrow">PLANO ATUAL</span>
    <h3>{ativo?'Profissional':'Gratuito'}</h3>
    <p>{ativo?'Auditorias ilimitadas e geração automática de recursos.':'Até 3 lotes por mês, recursos com prévia bloqueada.'}</p>
   </div>
  </div>
  {actionError && <p style={{color:'#dc2626',fontSize:13}}>{actionError}</p>}
  {ativo ? (
   <div className="billing-note"><Icon name="credit"/><div><b>Assinatura ativa</b><p>Gerencie forma de pagamento e histórico de cobrança pelo portal do Stripe.</p></div><button className="outline compact" onClick={handlePortal} disabled={portalLoading}>{portalLoading?'Abrindo...':'Gerenciar plano'}</button></div>
  ) : (
   <div className="billing-note"><Icon name="credit"/><div><b>Sem assinatura ativa</b><p>Assine para liberar auditorias ilimitadas e recursos completos.</p></div><button className="primary compact" onClick={handleCheckout} disabled={checkoutLoading}>{checkoutLoading?'Abrindo...':'Assinar agora'}</button></div>
  )}
 </div>;
}

// TODO backend: preferências de notificação ainda não persistem — dados de exemplo até existir a tabela.
function Notifications(){return <div className="toggle-list"><Toggle title="Auditoria concluída" sub="Receba um aviso quando um lote terminar de processar."/><Toggle title="Novo valor recuperável" sub="Aviso quando forem encontradas novas glosas recorríveis."/><Toggle title="Resumo semanal" sub="Receba toda segunda-feira um resumo financeiro."/></div>}

function Security(){return <div className="security"><div className="security-item"><Icon name="lock"/><div><b>Link mágico por e-mail</b><p>Seu acesso está protegido sem necessidade de senha.</p></div><Status text="Ativo"/></div><button className="outline compact" disabled title="Em breve">Encerrar outras sessões</button></div>}
