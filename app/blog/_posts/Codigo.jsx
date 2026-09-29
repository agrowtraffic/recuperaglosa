/* Link para a página de um código da Tabela 38, usado dentro dos
   artigos. Código inexistente derruba o build de propósito: artigo não
   pode apontar para página que não existe. */
import Link from 'next/link';
import { MOTIVOS } from '@/src/tiss/motivos';

export default function Codigo({ c, termo = false }) {
  const m = MOTIVOS[c];
  if (!m) throw new Error(`Artigo cita o código ${c}, que não está na Tabela 38`);
  const texto = m.descricao.charAt(0) + m.descricao.slice(1).toLowerCase();
  return (
    <Link href={`/codigos-de-glosa/${c}`}>
      {termo ? `${c} — ${texto}` : c}
    </Link>
  );
}
