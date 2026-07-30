/* 404 — sem este arquivo o Next entra em "missing required error
   components, refreshing..." e a página aparece sem estilo nenhum, em
   Times New Roman. */
import Link from 'next/link';
import { TelaAviso } from '@/app/_components/kit/TelaAviso';

export const metadata = { title: 'Página não encontrada' };

export default function NaoEncontrado() {
  return (
    <TelaAviso
      codigo="Erro 404"
      titulo="Esta página não existe"
      texto="O endereço pode ter mudado, ou o item que você procura foi removido."
      acoes={
        <>
          <Link href="/" className="rg-btn rg-btn-primary">
            Ir para a Visão geral
          </Link>
          <Link href="/lotes" className="rg-btn rg-btn-secondary">
            Enviar demonstrativo
          </Link>
        </>
      }
    />
  );
}
