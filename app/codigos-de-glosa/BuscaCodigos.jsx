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
  const [soVigentes, setSoVigentes] = useState(false);
  const q = normalizar(termo.trim());

  let total = 0;
  const visiveis = faixas.map((f) => {
    const itens = f.itens.filter(
      ([c, d, vigente]) => (!soVigentes || vigente) && (!q || c.includes(q) || normalizar(d).includes(q)),
    );
    total += itens.length;
    return { ...f, itens };
  });
  const filtrando = q || soVigentes;

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
        placeholder="Ex.: 3209, senha, duplicidade, carência…"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        autoComplete="off"
      />
      <label className={s.filtro}>
        <input type="checkbox" checked={soVigentes} onChange={(e) => setSoVigentes(e.target.checked)} />
        Mostrar só os códigos vigentes
      </label>
      {filtrando && (
        <p aria-live="polite" style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 14 }}>
          {total === 0 ? 'Nenhum código encontrado.' : `${total} código${total > 1 ? 's' : ''} encontrado${total > 1 ? 's' : ''}.`}
        </p>
      )}

      {visiveis.map((f) =>
        f.itens.length === 0 ? null : (
          <section key={f.id}>
            <h2 id={`faixa-${f.id}`}>
              {f.titulo} <small style={{ color: 'var(--muted)', fontSize: 15 }}>({f.rotulo})</small>
            </h2>
            {f.nota && <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: -4 }}>{f.nota}</p>}
            <ul className={s.lista}>
              {f.itens.map(([c, d, vigente]) => (
                <li key={c}>
                  <Link href={`/codigos-de-glosa/${c}`}>
                    <b>{c}</b>
                    <span>
                      {d}
                      {!vigente && <em className={s.tagEncerrado}>encerrado</em>}
                    </span>
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
