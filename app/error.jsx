'use client';

/* Fronteira de erro do app. Sem ela, qualquer exceção em Server
   Component derruba a rota para a tela crua do Next. */
import { useEffect } from 'react';
import Link from 'next/link';
import { TelaAviso } from '@/app/_components/kit/TelaAviso';

export default function Erro({ error, reset }) {
  useEffect(() => {
    /* Vai para os logs do servidor na Vercel. A mensagem não é mostrada
       ao usuário: pode conter detalhe de banco ou de integração. */
    console.error('[erro-na-rota]', error?.digest ?? '', error?.message ?? error);
  }, [error]);

  return (
    <TelaAviso
      tom="erro"
      codigo="Algo falhou"
      titulo="Não conseguimos carregar esta tela"
      texto="A falha foi registrada. Tentar de novo costuma resolver — os seus dados não foram afetados."
      acoes={
        <>
          <button type="button" className="rg-btn rg-btn-primary" onClick={reset}>
            Tentar de novo
          </button>
          <Link href="/" className="rg-btn rg-btn-secondary">
            Voltar ao início
          </Link>
        </>
      }
    />
  );
}
