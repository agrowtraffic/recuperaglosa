'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../_components/Icon';
import { Status, Field, Toggle } from '../_components/ui';

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
    {section==='Clínica'&&<FormClinic/>}
    {section==='Equipe'&&<Team/>}
    {section==='Assinatura'&&<Billing clinica={clinica} loading={loading}/>}
    {section==='Notificações'&&<Notifications/>}
    {section==='Segurança'&&<Security/>}
   </div>
  </div>
 </>;
}

// TODO backend: este formulário ainda não lê/grava a tabela clinica — dados de exemplo até existir o endpoint de edição de perfil.
function FormClinic(){return <form className="form-grid"><Field label="Nome da clínica" value="Clínica Sorriso"/><Field label="CNPJ" value="12.345.678/0001-90"/><Field label="E-mail financeiro" value="financeiro@clinicasorriso.com.br"/><Field label="Telefone" value="(11) 99999-0000"/><Field label="CNES" value="1234567"/><Field label="Cidade" value="São Paulo — SP"/><div className="form-actions"><button type="button" className="primary">Salvar alterações</button></div></form>}

// TODO backend: convites/membros de equipe ainda não existem no schema — dados de exemplo até existir a tabela.
function Team(){return <div><div className="team-row"><div className="avatar">HC</div><div><b>Henrique Costa</b><p>henrique@clinicasorriso.com.br</p></div><Status text="Administrador"/></div><div className="team-row"><div className="avatar">MS</div><div><b>Mariana Souza</b><p>mariana@clinicasorriso.com.br</p></div><Status text="Membro"/></div><button className="primary"><Icon name="plus"/>Convidar membro</button></div>}

function Billing({clinica,loading}){
 if(loading) return <div className="billing"><p style={{color:'#94a3b8'}}>Carregando informações do plano...</p></div>;
 const ativo=clinica?.plano==='ativo';
 return <div className="billing">
  <div className="billing-plan">
   <div>
    <span className="eyebrow">PLANO ATUAL</span>
    <h3>{ativo?'Profissional':'Gratuito'}</h3>
    <p>{ativo?'Auditorias ilimitadas e geração automática de recursos.':'Até 3 lotes por mês, recursos com prévia bloqueada.'}</p>
   </div>
  </div>
  {ativo ? (
   <div className="billing-note"><Icon name="credit"/><div><b>Assinatura ativa</b><p>Gerencie forma de pagamento e histórico de cobrança pelo portal do Stripe.</p></div><button className="outline compact">Gerenciar plano</button></div>
  ) : (
   <div className="billing-note"><Icon name="credit"/><div><b>Sem assinatura ativa</b><p>Assine para liberar auditorias ilimitadas e recursos completos.</p></div><button className="primary compact">Assinar agora</button></div>
  )}
 </div>;
}

// TODO backend: preferências de notificação ainda não persistem — dados de exemplo até existir a tabela.
function Notifications(){return <div className="toggle-list"><Toggle title="Auditoria concluída" sub="Receba um aviso quando um lote terminar de processar."/><Toggle title="Novo valor recuperável" sub="Aviso quando forem encontradas novas glosas recorríveis."/><Toggle title="Resumo semanal" sub="Receba toda segunda-feira um resumo financeiro."/></div>}

function Security(){return <div className="security"><div className="security-item"><Icon name="lock"/><div><b>Link mágico por e-mail</b><p>Seu acesso está protegido sem necessidade de senha.</p></div><Status text="Ativo"/></div><button className="outline compact">Encerrar outras sessões</button></div>}
