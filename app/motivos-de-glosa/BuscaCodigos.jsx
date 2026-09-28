'use client';
/* Busca por código ou termo na lista da Tabela 38.

   A lista completa vem renderizada no HTML do servidor (é o que o
   buscador lê); isto só esconde as linhas que não batem. Sem JS, a
   página continua inteira e navegável. */
import { useState } from 'react';
import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';

const normalizar = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function BuscaCodigos({ faixas }) {
  const [termo, setTermo] = useState('');
  const q = normalizar(termo.trim());

  let total = 0;
  const visiveis = faixas.map((f) => {
    const itens = q
      ? f.itens.filter(([c, d]) => c.includes(q) || normalizar(d).includes(q))
      : f.itens;
    total += itens.length;
    return { ...f, itens };
  });

  return (
    <>
      <label htmlFor="busca-codigo" style={{ fontWeight: 800, color: 'var(--ink)' }}>
        Buscar código ou motivo
      </label>
      <input
        id="busca-codigo"
        className={s.busca}
        type="search"
        inputMode="search"
        placeholder="Ex.: 1801, senha, duplicidade, carteira…"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        autoComplete="off"
      />
      {q && (
        <p aria-live="polite" style={{ marginTop: -6, color: 'var(--muted)', fontSize: 14 }}>
          {total === 0 ? 'Nenhum código encontrado.' : `${total} código${total > 1 ? 's' : ''} encontrado${total > 1 ? 's' : ''}.`}
        </p>
      )}

      {visiveis.map((f) =>
        f.itens.length === 0 ? null : (
          <section key={f.prefixo}>
            <h2 id={`faixa-${f.prefixo}`}>
              {f.titulo} <small style={{ color: 'var(--muted)', fontSize: 15 }}>({f.prefixo}xx)</small>
            </h2>
            <ul className={s.lista}>
              {f.itens.map(([c, d]) => (
                <li key={c}>
                  <Link href={`/motivos-de-glosa/${c}`}>
                    <b>{c}</b>
                    <span>{d}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ),
      )}
    </>
  );
}
