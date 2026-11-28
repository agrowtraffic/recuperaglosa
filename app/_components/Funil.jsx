'use client';

/* Escuta as páginas: guarda a origem, conta a demonstração vista e os
   cliques nos CTAs. Fica no layout porque a landing é HTML puro e não tem
   componente onde pendurar um onClick. */
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { capturarOrigem, ehInterno, registrar } from '@/lib/funil';

function destinoDoClique(href) {
  if (href.includes('wa.me/')) return 'whatsapp';
  if (href.includes('modo=cadastro')) return 'cadastro';
  if (href.endsWith('/demonstracao')) return 'demonstracao';
  return null;
}

export default function Funil() {
  const pathname = usePathname();
  const ultima = useRef(null);

  useEffect(() => {
    capturarOrigem();
    ehInterno(); // lê ?rg_interno=1 assim que a página abre
    if (ultima.current === pathname) return;
    ultima.current = pathname;
    if (pathname === '/demonstracao') registrar('demo_vista');
  }, [pathname]);

  useEffect(() => {
    const aoClicar = (e) => {
      const link = e.target.closest?.('a[href]');
      const destino = link && destinoDoClique(link.getAttribute('href'));
      if (destino) registrar('cta_clique', { detalhe: destino });
    };
    // captura: roda antes de o Next trocar a URL
    document.addEventListener('click', aoClicar, true);
    return () => document.removeEventListener('click', aoClicar, true);
  }, []);

  return null;
}
