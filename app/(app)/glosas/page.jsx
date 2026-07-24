'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '../_components/Icon';
import { Toolbar, SelectFilter, Metric, DataTable } from '../_components/ui';

export default function GlosasPage(){
 const [query,setQuery]=useState('');
 const [prioridade,setPrioridade]=useState('Todas');
 const filtered=[];

 return <>
  <div className="content-head"><div><h1>Glosas</h1><p>Priorize valores glosados e oportunidades de recuperação</p></div><Link href="/upload" className="primary"><Icon name="plus"/>Novo upload</Link></div>
  <Toolbar query={query} setQuery={setQuery} placeholder="Buscar guia, codigo ou motivo..."><SelectFilter value={prioridade} onChange={setPrioridade} options={['Todas','Alta','Media','Baixa']} label="Prioridade"/></Toolbar>
  <div className="metric-row"><Metric label="Total glosado" value="R$ 0,00" warn/><Metric label="Recorrivel" value="R$ 0,00" positive/><Metric label="Em analise" value="R$ 0,00"/><Metric label="Nao recorrivel" value="R$ 0,00"/></div>
  <div className="split-layout"><div className="page-card"><div className="card-title"><div><h2>Glosas identificadas</h2><p>Ordenadas por potencial de recuperacao</p></div></div><DataTable heads={['Guia','Codigo','Motivo','Valor','Prioridade','Situacao']} rows={filtered}/></div><aside className="insight-card"><span className="insight-icon"><Icon name="dollar"/></span><h3>Maior oportunidade</h3><strong>R$ 0,00</strong><p>Nenhuma glosa encontrada. Envie um demonstrativo para comecar.</p><Link href="/upload" className="primary full">Novo upload</Link></aside></div>
 </>;
}
