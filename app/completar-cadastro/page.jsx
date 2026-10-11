'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { nomeClinicaPadrao } from '@/lib/nome-clinica';

const TERMOS_VERSAO = '2026-07-24';

/* Último passo depois do login. Antes pedia 5 campos (clínica, CNPJ, nome,
   telefone, termos), e 2 de 3 logins com Google em outubro pararam aqui.
   Agora pede só o que o produto precisa para começar:
   - nome da clínica (obrigatório);
   - aceite dos termos (obrigatório; segue como caixa marcada pelo usuário);
   - nome do responsável só aparece se o Google não trouxe um;
   CNPJ e telefone ficam para Configurações, onde já existem. */
export default function CompletarCadastroPage(){
 const router = useRouter();
 const [nomeClinica,setNomeClinica] = useState('');
 const [nomeCompleto,setNomeCompleto] = useState('');
 const [nomeVeioDoGoogle,setNomeVeioDoGoogle] = useState(false);
 const [aceitouTermos,setAceitouTermos] = useState(false);
 const [loading,setLoading] = useState(false);
 const [error,setError] = useState('');

 useEffect(()=>{
  let ativo = true;
  createClient().auth.getUser().then(({ data })=>{
   const meta = data?.user?.user_metadata ?? {};
   const nome = String(meta.full_name || meta.name || '').trim();
   if(ativo && nome.length >= 3){ setNomeCompleto(nome); setNomeVeioDoGoogle(true); }
  }).catch(()=>{});
  return ()=>{ ativo = false; };
 },[]);

 /* "Pular" não elimina a clínica: todas as tabelas dependem de clinica_id e
    o middleware manda quem não tem `usuario` de volta para cá. Pular só
    adia o NOME, que entra como "Clínica de <primeiro nome>" e é editável
    em Configurações. O aceite dos termos continua obrigatório. */
 async function handleSubmit(event){
  event.preventDefault();
  setError('');

  if(nomeCompleto.trim().length < 3){ setError('Informe seu nome completo.'); return; }
  const nomeFinal = nomeClinica.trim().length >= 2 ? nomeClinica.trim() : nomeClinicaPadrao(nomeCompleto);
  if(!aceitouTermos){ setError('É necessário aceitar os Termos de Uso e a Política de Privacidade.'); return; }

  setLoading(true);
  try{
   const supabase = createClient();
   const { data: clinicaId, error: rpcError } = await supabase.rpc('completar_cadastro', {
     p_nome_clinica: nomeFinal,
     p_cnpj: '',
     p_nome_completo: nomeCompleto.trim(),
     p_telefone: '',
     p_termos_aceitos: aceitouTermos,
     p_termos_versao: TERMOS_VERSAO,
   });
   if(rpcError) throw rpcError;
   if(!clinicaId) throw new Error('RPC não retornou clinica_id');
   // Direto para o upload: é onde o valor aparece (e onde está o exemplo).
   router.replace('/lotes');
   router.refresh();
  }catch(e){
   console.error('Erro ao completar cadastro:',e);
   setError('Não foi possível concluir o cadastro. Tente novamente.');
  }finally{
   setLoading(false);
  }
 }

 const temNome = nomeCompleto.trim().length >= 3;
 const campo = { padding:'12px 14px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:15, fontFamily:'inherit' };

 return (
  <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', background:'#f5f8fb' }}>
   <div style={{ width:'100%', maxWidth:440, background:'#fff', padding:32, borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
    <img src="/marca/horizontal.png" alt="RecuperaGlosa" width={150} height={44} style={{ height:44, width:'auto', marginBottom:20 }}/>
    <h1 style={{ marginTop:0, marginBottom:8, fontSize:24, fontWeight:'bold', color:'#0f172a' }}>Falta só um passo</h1>
    <p style={{ color:'#64748b', marginTop:0, marginBottom:24, fontSize:14, lineHeight:1.5 }}>
     Aceite os termos e você já pode enviar o demonstrativo do convênio e ver quanto foi glosado. O nome da clínica pode ficar para depois.
    </p>

    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
     <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <span style={{ fontWeight:500, color:'#334155', fontSize:14 }}>Nome da clínica <small style={{color:'#94a3b8'}}>(pode alterar depois)</small></span>
      <input value={nomeClinica} onChange={e=>setNomeClinica(e.target.value)} autoFocus
       placeholder={temNome ? nomeClinicaPadrao(nomeCompleto) : 'Clínica Sorriso'}
       style={campo}/>
      {temNome && (
       <small style={{ color:'#94a3b8', fontSize:12 }}>
        Se deixar em branco, usamos “{nomeClinicaPadrao(nomeCompleto)}”.
       </small>
      )}
     </label>

     {!nomeVeioDoGoogle && (
      <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
       <span style={{ fontWeight:500, color:'#334155', fontSize:14 }}>Seu nome completo</span>
       <input value={nomeCompleto} onChange={e=>setNomeCompleto(e.target.value)} placeholder="Seu nome" required
        style={campo}/>
      </label>
     )}

     <label style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'#334155' }}>
      <input type="checkbox" checked={aceitouTermos} onChange={e=>setAceitouTermos(e.target.checked)} style={{ marginTop:3 }}/>
      <span>Li e aceito os <Link href="/termos" target="_blank" rel="noopener noreferrer" style={{ color:'#16a34a' }}>Termos de Uso</Link> e a <Link href="/privacidade" target="_blank" rel="noopener noreferrer" style={{ color:'#16a34a' }}>Política de Privacidade</Link>.</span>
     </label>

     {error && (
      <div role="alert" style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#991b1b', padding:12, borderRadius:8, fontSize:14 }}>
       {error}
      </div>
     )}

     <button type="submit" disabled={loading}
      style={{ padding:'14px 16px', background: loading ? '#cbd5e1' : '#16a34a', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor: loading ? 'not-allowed':'pointer', fontSize:15 }}>
      {loading ? 'Salvando...' : 'Começar a analisar'}
     </button>

     {/* Pular: mesmo envio, sem o nome. Os termos continuam exigidos. */}
     <button type="button" disabled={loading}
      onClick={()=>handleSubmit({ preventDefault(){} })}
      style={{ background:'none', border:0, padding:0, color:'#64748b', fontSize:13, textDecoration:'underline', cursor: loading ? 'not-allowed':'pointer' }}>
      Pular o nome por enquanto
     </button>

     <p style={{ margin:0, fontSize:12, color:'#94a3b8', textAlign:'center' }}>
      Grátis para começar: 3 análises por mês, sem cartão.
     </p>
    </form>
   </div>
  </main>
 );
}
