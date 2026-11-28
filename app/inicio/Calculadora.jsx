'use client';
/* Simulação do custo da glosa com os números do próprio visitante.

   Não existe média confiável de glosa para consultório pequeno, então a
   página não inventa uma: a pessoa escolhe o percentual, e o texto diz
   com todas as letras que é simulação. O número real vem do XML — que é
   exatamente o próximo passo do CTA. */
import { useState } from 'react';
import s from './landing.module.css';

const reais = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function Calculadora({ cadastro }) {
  const [faturamento, setFaturamento] = useState(30000);
  const [taxa, setTaxa] = useState(5);

  const mes = (faturamento * taxa) / 100;
  const ano = mes * 12;

  return (
    <div className={s.calc}>
      <div className={s.calcCopy}>
        <span className={s.eyebrow}>Faça a conta</span>
        <h2>Quanto a glosa pode estar levando por ano?</h2>
        <p>Mova os controles com os números do seu consultório.</p>

        <label className={s.field}>
          <span>Faturamento com convênio por mês <b>{reais(faturamento)}</b></span>
          <input
            type="range"
            min={5000}
            max={150000}
            step={1000}
            value={faturamento}
            onChange={(e) => setFaturamento(Number(e.target.value))}
          />
        </label>

        <label className={s.field}>
          <span>Quanto você acha que é glosado <b>{taxa}%</b></span>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={taxa}
            onChange={(e) => setTaxa(Number(e.target.value))}
          />
        </label>
      </div>

      <div className={s.calcResult} aria-live="polite">
        <small>Saindo do seu caixa por ano</small>
        <strong>{reais(ano)}</strong>
        <p>São {reais(mes)} por mês que o convênio deixou de pagar, se o percentual for esse.</p>
        <a className={`${s.btn} ${s.btnLime} ${s.btnBig}`} href={cadastro}>Ver o número real no meu XML →</a>
        <small className={s.calcNote}>Simulação com o percentual que você escolheu, não uma estimativa. O valor real está no seu demonstrativo.</small>
      </div>
    </div>
  );
}
