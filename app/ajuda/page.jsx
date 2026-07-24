import Link from 'next/link';

export const metadata = {
  title: 'Ajuda | RecuperaGlosa',
  description: 'Central de ajuda do RecuperaGlosa.',
};

const FAQ = [
 {
  q: 'Qual arquivo eu envio para fazer a auditoria?',
  a: 'O demonstrativo de pagamento que o convênio te envia, no formato XML, padrão TISS/ANS. É o mesmo arquivo que sua operadora disponibiliza quando fecha o pagamento de um lote de guias.',
 },
 {
  q: 'O RecuperaGlosa confia no valor de glosa que a operadora informou?',
  a: 'Não. Recalculamos a glosa a partir dos valores apresentados e pagos no próprio XML, em vez de simplesmente repetir o que a operadora já te disse.',
 },
 {
  q: 'Meus dados ficam misturados com os de outras clínicas?',
  a: 'Não. O banco de dados usa Row Level Security (RLS) do Postgres — cada clínica só consegue ler e gravar os próprios registros, mesmo que várias contas usem o mesmo servidor.',
 },
 {
  q: 'Como funciona a cobrança?',
  a: 'O plano gratuito permite algumas análises por mês. O plano pago é uma assinatura recorrente processada pelo Stripe; você pode assinar ou cancelar a qualquer momento em Configurações > Assinatura.',
 },
 {
  q: 'O texto de recurso gerado já pode ser enviado direto ao convênio?',
  a: 'Ele é um ponto de partida gerado a partir dos dados da glosa. Recomendamos revisar antes de enviar — sua equipe conhece detalhes do atendimento que o sistema não tem.',
 },
 {
  q: 'Posso usar o RecuperaGlosa para mais de uma operadora?',
  a: 'Sim, a auditoria funciona por demonstrativo enviado, independente da operadora, desde que o arquivo siga o padrão TISS/ANS.',
 },
];

export default function AjudaPage(){
 return (
  <main style={{ maxWidth:760, margin:'0 auto', padding:'48px 20px 80px', color:'#1e293b', lineHeight:1.7, fontSize:15 }}>
   <p style={{ marginBottom:24 }}><Link href="/login" style={{ color:'#16a34a', textDecoration:'none', fontWeight:600 }}>← Voltar</Link></p>
   <h1 style={{ fontSize:28, marginBottom:8, color:'#0f172a' }}>Central de ajuda</h1>
   <p style={{ color:'#64748b', marginBottom:32 }}>Dúvidas comuns sobre o RecuperaGlosa. Não encontrou o que precisava? Fala com a gente pelos canais abaixo.</p>

   <section style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:40 }}>
    <a href="https://wa.me/5511977315655" target="_blank" rel="noopener noreferrer"
     style={{ flex:'1 1 220px', padding:'16px', background:'#eaf8ee', border:'1px solid #bbf0c9', borderRadius:12, textDecoration:'none', color:'#0f172a' }}>
     <strong style={{ display:'block', marginBottom:4 }}>💬 WhatsApp</strong>
     <span style={{ fontSize:13, color:'#166534' }}>(11) 97731-5655 — resposta em até 1 dia útil</span>
    </a>
    <a href="mailto:suporte@recuperaglosa.com.br"
     style={{ flex:'1 1 220px', padding:'16px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, textDecoration:'none', color:'#0f172a' }}>
     <strong style={{ display:'block', marginBottom:4 }}>✉️ E-mail</strong>
     <span style={{ fontSize:13, color:'#1d4ed8' }}>suporte@recuperaglosa.com.br — resposta em até 1 dia útil</span>
    </a>
   </section>

   <h2 style={{ fontSize:19, color:'#0f172a', marginBottom:16 }}>Perguntas frequentes</h2>
   {FAQ.map(({q,a})=>(
    <details key={q} style={{ marginBottom:12, border:'1px solid #e2e8f0', borderRadius:10, padding:'12px 16px' }}>
     <summary style={{ cursor:'pointer', fontWeight:600, color:'#0f172a' }}>{q}</summary>
     <p style={{ marginTop:8, marginBottom:0, color:'#475569', fontSize:14 }}>{a}</p>
    </details>
   ))}

   <p style={{ marginTop:32, fontSize:13, color:'#94a3b8' }}>
    Também temos <Link href="/termos" style={{ color:'#16a34a' }}>Termos de Uso</Link> e <Link href="/privacidade" style={{ color:'#16a34a' }}>Política de Privacidade</Link>.
   </p>
  </main>
 );
}
