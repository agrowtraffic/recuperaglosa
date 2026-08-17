import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Enviar Demonstrativo de Glosas — RecuperaGlosa',
  description: 'Analise seu XML TISS, identifique glosas e gere recursos de contestação automaticamente.',
};

export default function UploadPage() {
  redirect('/lotes');
}
