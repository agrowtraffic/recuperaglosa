'use client';
/* Botão de copiar o modelo de recurso. É a ação que quem chega pela
   busca veio fazer; sem ele, a pessoa seleciona texto no celular. */
import { useState } from 'react';
import s from './publico.module.css';

export default function CopiarModelo({ texto }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* Sem permissão de clipboard: o texto continua visível para seleção. */
    }
  }

  return (
    <button type="button" className={s.copiar} onClick={copiar} aria-live="polite">
      {copiado ? '✓ Modelo copiado' : 'Copiar modelo'}
    </button>
  );
}
