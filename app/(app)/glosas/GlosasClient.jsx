'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '../_components/Icon';
import { Toolbar, SelectFilter, Metric, DataTable } from '../_components/ui';

export default function GlosasClient({ glosas, totalGlosado, recorrivel, maiorOportunidade }) {
  const [query, setQuery] = useState('');
  const [prioridade, setPrioridade] = useState('Todas');

  const filtered = useMemo(() => {
    return glosas.filter(g => {
      const matchQuery = query === '' ||
        g.numeroGuia.toLowerCase().includes(query.toLowerCase()) ||
        g.codigoGlosa.toLowerCase().includes(query.toLowerCase()) ||
        g.motivoGlosa.toLowerCase().includes(query.toLowerCase());

      let matchPrioridade = true;
      if (prioridade !== 'Todas') {
        if (prioridade === 'Alta') matchPrioridade = g.valorGlosado >= 500;
        else if (prioridade === 'Media') matchPrioridade = g.valorGlosado >= 100 && g.valorGlosado < 500;
        else if (prioridade === 'Baixa') matchPrioridade = g.valorGlosado < 100;
      }

      return matchQuery && matchPrioridade;
    });
  }, [glosas, query, prioridade]);

  const rows = filtered.length > 0
    ? filtered.map(g => [
        g.numeroGuia,
        g.codigoGlosa,
        g.motivoGlosa,
        `R$ ${g.valorGlosado.toFixed(2).replace('.', ',')}`,
        g.valorGlosado >= 500 ? 'Alta' : g.valorGlosado >= 100 ? 'Média' : 'Baixa',
        g.recorrivel ? '✅ Recorrível' : '⚠️ Não recorrível'
      ])
    : [];

  return (
    <>
      <Toolbar query={query} setQuery={setQuery} placeholder="Buscar guia, codigo ou motivo...">
        <SelectFilter value={prioridade} onChange={setPrioridade} options={['Todas','Alta','Media','Baixa']} label="Prioridade"/>
      </Toolbar>
      <div className="metric-row">
        <Metric label="Total glosado" value={`R$ ${totalGlosado.toFixed(2).replace('.', ',')}`} warn/>
        <Metric label="Recorrível" value={`R$ ${recorrivel.toFixed(2).replace('.', ',')}`} positive/>
        <Metric label="Em análise" value="R$ 0,00"/>
        <Metric label="Não recorrível" value={`R$ ${(totalGlosado - recorrivel).toFixed(2).replace('.', ',')}`}/>
      </div>
      <div className="split-layout">
        <div className="page-card">
          <div className="card-title">
            <div>
              <h2>Glosas identificadas</h2>
              <p>Ordenadas por potencial de recuperação</p>
            </div>
          </div>
          {filtered.length === 0 ? (
            <p style={{color:'#999',padding:'1rem'}}>Nenhuma glosa encontrada.</p>
          ) : (
            <DataTable heads={['Guia','Código','Motivo','Valor','Prioridade','Situação']} rows={rows}/>
          )}
        </div>
        <aside className="insight-card">
          <span className="insight-icon"><Icon name="dollar"/></span>
          <h3>Maior oportunidade</h3>
          {maiorOportunidade ? (
            <>
              <strong>R$ {maiorOportunidade.valorGlosado.toFixed(2).replace('.', ',')}</strong>
              <p>Guia {maiorOportunidade.numeroGuia} • {maiorOportunidade.beneficiario}</p>
              <Link href={`/recursos?guia=${maiorOportunidade.numeroGuia}`} className="primary full">Gerar recurso</Link>
            </>
          ) : (
            <>
              <strong>R$ 0,00</strong>
              <p>Nenhuma glosa encontrada. Envie um demonstrativo para começar.</p>
              <Link href="/upload" className="primary full">Novo upload</Link>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
