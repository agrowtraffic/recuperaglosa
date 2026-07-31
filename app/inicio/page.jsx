/* ============================================================
   LANDING  →  servida em / para quem não tem sessão.

   O middleware reescreve (não redireciona) a raiz para cá quando não há
   sessão, então a URL que a pessoa vê continua sendo recuperaglosa.com.br.
   Reescrita e não redirect porque o endereço de uma landing é ativo de
   marketing: um 307 para /inicio jogaria fora o link que vai em anúncio,
   e-mail e busca.

   Quem tem sessão nunca chega aqui — a raiz segue servindo o painel.

   Antes disso a landing morava num domínio de terceiro. O canonical dela
   apontava para lá, então o Google indexava a página de lançamento sob um
   endereço que não é da empresa, e o recuperaglosa.com.br ficava sem
   nenhum conteúdo indexável, só redirecionando para o login.
   ============================================================ */
import { HTML_LANDING } from './conteudo';

export const metadata = {
  /* `absolute` para escapar do template `%s · RecuperaGlosa` do layout
     raiz, que aqui deixaria a marca repetida duas vezes no mesmo título —
     e é este o texto que aparece no resultado de busca. */
  title: { absolute: 'RecuperaGlosa — auditoria de glosas de convênio para clínicas' },
  description:
    'Analise o XML TISS, identifique valores glosados e organize recursos para sua clínica agir antes do prazo.',
  /* Aponta para a raiz, não para /inicio: é a raiz que as pessoas
     acessam e é ela que deve concentrar o sinal de busca. Sem isto, os
     dois endereços disputariam a mesma página. */
  alternates: { canonical: '/' },
  openGraph: {
    title: 'RecuperaGlosa — auditoria de glosas para clínicas',
    description:
      'Analise o XML TISS, identifique valores glosados e organize recursos para sua clínica agir antes do prazo.',
    url: '/',
    type: 'website',
  },
};

export default function Landing() {
  /* O HTML vem pronto do builder e é conteúdo próprio, versionado neste
     repositório — não entrada de usuário. */
  return <div dangerouslySetInnerHTML={{ __html: HTML_LANDING }} />;
}
