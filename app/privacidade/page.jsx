import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidade | RecuperaGlosa',
  description: 'Política de Privacidade do RecuperaGlosa.',
};

const VERSAO = '2026-07-24';

export default function PrivacidadePage(){
 return (
  <main style={{ maxWidth:760, margin:'0 auto', padding:'48px 20px 80px', color:'#1e293b', lineHeight:1.7, fontSize:15 }}>
   <p style={{ marginBottom:24 }}><Link href="/login" style={{ color:'#16a34a', textDecoration:'none', fontWeight:600 }}>← Voltar</Link></p>
   <h1 style={{ fontSize:28, marginBottom:4, color:'#0f172a' }}>Política de Privacidade</h1>
   <p style={{ color:'#64748b', marginBottom:32, fontSize:13 }}>Versão {VERSAO} — vigente a partir desta data.</p>

   <Section title="1. Controlador">
    <p>O RecuperaGlosa é operado por <strong>Henrique Cruz</strong>, pessoa física (CPF disponível mediante solicitação), responsável pelo tratamento dos dados descritos nesta política.</p>
   </Section>

   <Section title="2. Dados que coletamos">
    <p><strong>Da sua conta:</strong> nome, e-mail, telefone e nome da clínica, informados no cadastro ou recebidos do Google quando você entra com essa opção.</p>
    <p><strong>Dos demonstrativos que você envia:</strong> os arquivos XML de demonstrativo de pagamento (padrão TISS/ANS) podem conter dados de beneficiários do convênio (nome, número de carteira, dados do atendimento) — dados de terceiros que não são seus funcionários. Para esses dados, sua clínica é a controladora e o RecuperaGlosa atua como operador, tratando-os apenas para processar a auditoria e gerar os recursos que você solicitou.</p>
    <p><strong>Dados de pagamento:</strong> processados diretamente pelo Stripe. Não armazenamos número completo de cartão de crédito nos nossos servidores.</p>
    <p><strong>Dados técnicos:</strong> endereço IP e informações de sessão, coletados automaticamente para autenticação e segurança.</p>
   </Section>

   <Section title="3. Para que usamos esses dados">
    <ul style={{ paddingLeft:20 }}>
     <li>Autenticar seu acesso e manter sua sessão;</li>
     <li>Processar os demonstrativos enviados e calcular as glosas;</li>
     <li>Gerar os textos de recurso;</li>
     <li>Cobrar a assinatura, quando aplicável;</li>
     <li>Enviar comunicações operacionais sobre sua conta;</li>
     <li>Cumprir obrigações legais e responder a autoridades quando exigido.</li>
    </ul>
   </Section>

   <Section title="4. Base legal">
    <p>Tratamos seus dados com base na execução do contrato de uso do serviço (LGPD, art. 7º, V) e, quando aplicável, no seu consentimento explícito no cadastro. Os dados de beneficiários presentes nos demonstrativos são tratados sob a base legal e responsabilidade da sua clínica, que é quem detém a relação com o paciente.</p>
   </Section>

   <Section title="5. Com quem compartilhamos">
    <p>Compartilhamos dados apenas com os prestadores necessários para operar o serviço: <strong>Supabase</strong> (banco de dados e autenticação) e <strong>Stripe</strong> (processamento de pagamento). Não vendemos dados a terceiros.</p>
   </Section>

   <Section title="6. Retenção">
    <p>Mantemos os dados da sua conta e dos demonstrativos enquanto sua conta estiver ativa. Se você encerrar a conta, os dados são apagados ou anonimizados em até 90 dias, salvo obrigação legal de retenção por prazo maior.</p>
   </Section>

   <Section title="7. Segurança">
    <p>Os dados trafegam por conexão HTTPS. O banco de dados usa políticas de Row Level Security (RLS) do Postgres, que restringem cada clínica ao acesso exclusivo dos próprios dados. O acesso à aplicação exige autenticação.</p>
   </Section>

   <Section title="8. Seus direitos">
    <p>Você pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados pessoais, ou revogar consentimento, a qualquer momento pelo canal de contato abaixo. Responderemos em até 15 dias.</p>
   </Section>

   <Section title="9. Alterações desta política">
    <p>Podemos atualizar esta política. Mudanças relevantes serão comunicadas por e-mail ou aviso no produto.</p>
   </Section>

   <Section title="10. Contato">
    <p>Para exercer seus direitos ou tirar dúvidas sobre privacidade: <a href="mailto:admin@recuperaglosa.com.br" style={{ color:'#16a34a' }}>admin@recuperaglosa.com.br</a> ou <a href="mailto:suporte@recuperaglosa.com.br" style={{ color:'#16a34a' }}>suporte@recuperaglosa.com.br</a>.</p>
   </Section>

   <p style={{ marginTop:40 }}><Link href="/termos" style={{ color:'#16a34a', textDecoration:'none', fontWeight:600 }}>Ver também: Termos de Uso →</Link></p>
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
