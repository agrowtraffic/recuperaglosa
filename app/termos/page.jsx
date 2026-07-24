import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso | RecuperaGlosa',
  description: 'Termos de Uso do RecuperaGlosa.',
};

const VERSAO = '2026-07-24';

export default function TermosPage(){
 return (
  <main style={{ maxWidth:760, margin:'0 auto', padding:'48px 20px 80px', color:'#1e293b', lineHeight:1.7, fontSize:15 }}>
   <p style={{ marginBottom:24 }}><Link href="/login" style={{ color:'#16a34a', textDecoration:'none', fontWeight:600 }}>← Voltar</Link></p>
   <h1 style={{ fontSize:28, marginBottom:4, color:'#0f172a' }}>Termos de Uso</h1>
   <p style={{ color:'#64748b', marginBottom:32, fontSize:13 }}>Versão {VERSAO} — vigente a partir desta data.</p>

   <Section title="1. Quem somos">
    <p>O RecuperaGlosa é um serviço de auditoria de glosas de convênio para clínicas e consultórios, disponibilizado por <strong>Henrique Cruz</strong>, pessoa física (CPF disponível mediante solicitação ao canal de contato abaixo). Ainda não constituímos pessoa jurídica própria; esta seção será atualizada assim que isso ocorrer.</p>
   </Section>

   <Section title="2. O que o serviço faz">
    <p>Você envia um demonstrativo de pagamento de convênio (arquivo XML no padrão TISS/ANS) e o RecuperaGlosa recalcula os valores glosados, mostra o motivo de cada glosa e gera um texto de recurso (contestação) para você revisar e enviar ao convênio.</p>
   </Section>

   <Section title="3. Conta e cadastro">
    <p>Para usar o serviço, você precisa criar uma conta com e-mail (senha ou Google) e completar o cadastro da sua clínica. As informações fornecidas devem ser verdadeiras. Você é responsável por manter a confidencialidade da sua senha e pelo uso da conta.</p>
   </Section>

   <Section title="4. Planos e cobrança">
    <p>O RecuperaGlosa oferece um plano gratuito com limite de auditorias por mês e um plano pago com auditorias ilimitadas, cobrado por assinatura recorrente via Stripe. Você pode cancelar a assinatura a qualquer momento pelo portal de cobrança; o acesso ao plano pago permanece até o fim do período já pago.</p>
   </Section>

   <Section title="5. Uso aceitável">
    <p>Você concorda em não enviar arquivos que não sejam demonstrativos legítimos da sua própria clínica, não tentar acessar dados de outras clínicas, e não usar o serviço para fins ilegais.</p>
   </Section>

   <Section title="6. Responsabilidade sobre os recursos gerados">
    <p>Os textos de recurso (contestação) gerados pelo RecuperaGlosa são um ponto de partida redigido automaticamente a partir dos dados do seu demonstrativo. A responsabilidade por revisar, adaptar e enviar cada recurso ao convênio é sua. O RecuperaGlosa não garante que uma glosa será revertida.</p>
   </Section>

   <Section title="7. Disponibilidade">
    <p>Fazemos o possível para manter o serviço disponível, mas não garantimos operação ininterrupta. Manutenções e instabilidades podem ocorrer.</p>
   </Section>

   <Section title="8. Encerramento de conta">
    <p>Você pode encerrar sua conta a qualquer momento entrando em contato pelo canal abaixo. Podemos suspender contas que violem estes Termos.</p>
   </Section>

   <Section title="9. Alterações destes Termos">
    <p>Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas por e-mail ou aviso no próprio produto. O uso continuado do serviço após uma atualização significa que você aceita os novos termos.</p>
   </Section>

   <Section title="10. Contato">
    <p>Dúvidas sobre estes Termos: <a href="mailto:suporte@recuperaglosa.com.br" style={{ color:'#16a34a' }}>suporte@recuperaglosa.com.br</a> ou WhatsApp <a href="https://wa.me/5511977315655" style={{ color:'#16a34a' }}>(11) 97731-5655</a>.</p>
   </Section>

   <p style={{ marginTop:40 }}><Link href="/privacidade" style={{ color:'#16a34a', textDecoration:'none', fontWeight:600 }}>Ver também: Política de Privacidade →</Link></p>
  </main>
 );
}

function Section({ title, children }){
 return (
  <section style={{ marginBottom:28 }}>
   <h2 style={{ fontSize:17, color:'#0f172a', marginBottom:8 }}>{title}</h2>
   {children}
  </section>
 );
}
