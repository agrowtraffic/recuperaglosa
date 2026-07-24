'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CompletarCadastroPage(){
 const router = useRouter();
 const [nomeClinica,setNomeClinica] = useState('');
 const [cnpj,setCnpj] = useState('');
 const [nomeCompleto,setNomeCompleto] = useState('');
 const [telefone,setTelefone] = useState('');
 const [loading,setLoading] = useState(false);
 const [error,setError] = useState('');

 async function handleSubmit(event){
  event.preventDefault();
  setError('');

  if(nomeClinica.trim().length < 2){ setError('Informe o nome da clínica.'); return; }
  if(nomeCompleto.trim().length < 3){ setError('Informe seu nome completo.'); return; }

  setLoading(true);
  try{
   const supabase = createClient();
   const { error: rpcError } = await supabase.rpc('completar_cadastro', {
     p_nome_clinica: nomeClinica.trim(),
     p_cnpj: cnpj.trim(),
     p_nome_completo: nomeCompleto.trim(),
     p_telefone: telefone.trim(),
   });
   if(rpcError) throw rpcError;
   router.replace('/');
   router.refresh();
  }catch(e){
   console.error('Erro ao completar cadastro:',e);
   setError('Não foi possível concluir o cadastro. Tente novamente.');
  }finally{
   setLoading(false);
  }
 }

 return (
  <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', background:'#f5f8fb' }}>
   <div style={{ width:'100%', maxWidth:480, background:'#fff', padding:32, borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
    <h1 style={{ marginTop:0, fontSize:24, fontWeight:'bold', color:'#0f172a' }}>Complete seu cadastro</h1>
    <p style={{ color:'#64748b', marginBottom:24, fontSize:14 }}>Precisamos de mais alguns dados para configurar sua clínica.</p>

    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
     <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <span style={{ fontWeight:500, color:'#334155', fontSize:14 }}>Nome da clínica</span>
      <input value={nomeClinica} onChange={e=>setNomeClinica(e.target.value)} placeholder="Clínica Sorriso" required
       style={{ padding:'10px 12px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:14, fontFamily:'inherit' }}/>
     </label>

     <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <span style={{ fontWeight:500, color:'#334155', fontSize:14 }}>CNPJ <small style={{color:'#94a3b8'}}>(opcional)</small></span>
      <input value={cnpj} onChange={e=>setCnpj(e.target.value)} placeholder="00.000.000/0001-00"
       style={{ padding:'10px 12px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:14, fontFamily:'inherit' }}/>
     </label>

     <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <span style={{ fontWeight:500, color:'#334155', fontSize:14 }}>Seu nome completo</span>
      <input value={nomeCompleto} onChange={e=>setNomeCompleto(e.target.value)} placeholder="Seu nome" required
       style={{ padding:'10px 12px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:14, fontFamily:'inherit' }}/>
     </label>

     <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <span style={{ fontWeight:500, color:'#334155', fontSize:14 }}>Telefone <small style={{color:'#94a3b8'}}>(opcional)</small></span>
      <input value={telefone} onChange={e=>setTelefone(e.target.value)} placeholder="(11) 99999-0000"
       style={{ padding:'10px 12px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:14, fontFamily:'inherit' }}/>
     </label>

     {error && (
      <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#991b1b', padding:12, borderRadius:8, fontSize:14 }}>
       {error}
      </div>
     )}

     <button type="submit" disabled={loading}
      style={{ padding:'12px 16px', background: loading ? '#cbd5e1' : '#16a34a', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor: loading ? 'not-allowed':'pointer', fontSize:14 }}>
      {loading ? 'Salvando...' : 'Concluir cadastro'}
     </button>
    </form>
   </div>
  </main>
 );
}
