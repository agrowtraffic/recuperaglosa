/* 404 de dentro do app (ex: /recursos/[id] inexistente).

   Existe separado do 404 raiz para o usuário não ser jogado fora da
   navegação: aqui a sidebar e a topbar continuam, e ele volta para
   onde estava com um clique. */
import Link from 'next/link';
import { PageHeader, EmptyState } from '@/app/_components/kit/Primitives';
import { SearchX } from 'lucide-react';

export const metadata = { title: 'Não encontrado' };

export default function NaoEncontradoNoApp() {
  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader
        eyebrow="Erro 404"
        titulo="Não encontramos este item"
        descricao="Ele pode ter sido removido, ou o endereço está incorreto."
      />
      <div className="rg-card">
        <EmptyState
          icone={SearchX}
          titulo="Nada aqui"
          texto="Confira o endereço ou volte para uma das telas abaixo."
          acao={
            <div className="rg-row rg-row-wrap" style={{ gap: 10, justifyContent: 'center' }}>
              <Link href="/" className="rg-btn rg-btn-primary">Visão geral</Link>
              <Link href="/glosas" className="rg-btn rg-btn-secondary">Glosas</Link>
              <Link href="/recursos" className="rg-btn rg-btn-secondary">Recursos</Link>
            </div>
          }
        />
      </div>
    </main>
  );
}
