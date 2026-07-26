'use client';

import { useState, useMemo } from 'react';
import { Icon } from '../_components/Icon';
import { Toolbar, SelectFilter, Metric, DataTable } from '../_components/ui';

export default function GuiasClient({ guias, totalGuias, comGlosa, semGlosa, taxaAprovacao }) {
  const [query, setQuery] = useState('');
  const [operadora, setOperadora] = useState('Todas');

  const filtered = useMemo(() => {
    return guias.filter(g => {
      const matchQuery = query === '' ||
        g.numeroGuia.toLowerCase().includes(query.toLowerCase()) ||
        g.beneficiario.toLowerCase().includes(query.toLowerCase()) ||
        g.operadora.toLowerCase().includes(query.toLowerCase());

      const matchOperadora = operadora === 'Todas' || g.operadora === operadora;

      return matchQuery && matchOperadora;
    });
  }, [guias, query, operadora]);

  const operadoras = ['Todas', ...new Set(guias.map(g => g.operadora).filter(o => o !== '—'))];

  const rows = filtered.length > 0
    ? filtered.map(g => [
        g.numeroGuia,
        g.beneficiario,
        g.operadora,
        g.dataAtendimento,
        `R$ ${g.valorApresentado.toFixed(2).replace('.', ',')}`,
        `R$ ${g.valorPago.toFixed(2).replace('.', ',')}`,
        `R$ ${g.valorGlosado.toFixed(2).replace('.', ',')}`,
        g.valorGlosado > 0 ? '🔴' : '✅'
      ])
    : [];

  return (
    <>
      <Toolbar query={query} setQuery={setQuery} placeholder="Buscar guia, paciente ou operadora...">
        <SelectFilter value={operadora} onChange={setOperadora} options={operadoras} label="Operadora"/>
      </Toolbar>
      <div className="metric-row">
        <Metric label="Guias auditadas" value={String(totalGuias)}/>
        <Metric label="Com glosa" value={String(comGlosa)} warn/>
        <Metric label="Sem glosa" value={String(semGlosa)} positive/>
        <Metric label="Taxa de aprovação" value={`${taxaAprovacao}%`} positive/>
      </div>
      <div className="page-card">
        <div className="card-title">
          <div>
            <h2>Guias auditadas</h2>
            <p>Valores apresentados, pagos e glosados</p>
          </div>
          <button className="outline compact" disabled title="Em breve"><Icon name="download"/>Exportar</button>
        </div>
        {filtered.length === 0 ? (
          <p style={{color:'#999',padding:'1rem'}}>Nenhuma guia encontrada.</p>
        ) : (
          <DataTable heads={['Nº da guia','Paciente','Operadora','Data','Apresentado','Pago','Glosado','Status']} rows={rows}/>
        )}
      </div>
    </>
  );
}
