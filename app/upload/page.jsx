import { redirect } from 'next/navigation';

/* A tela de envio agora vive em /lotes, dentro do shell do app (com sidebar,
   topbar e histórico). Esta rota fica só como redirect para não quebrar
   links antigos. */
export default function UploadPage() {
  redirect('/lotes');
}
