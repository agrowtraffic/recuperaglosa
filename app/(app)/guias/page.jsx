'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '../_components/Icon';
import { Toolbar, SelectFilter, Metric, DataTable } from '../_components/ui';

export default function GuiasPage(){
 const [query,setQuery]=useState('');
 const [operadora,setOperadora]=useState('Todas');
 const filtered=[];

 return <>
  <div className="content-head"><div><h1>Guias</h1><p>Consulte todas as guias identificadas nos demonstrativos</p></div><Link href="/upload" className="primary"><Icon name="plus"/>Novo upload</Link></div>
  <Toolbar query={query} setQuery={setQuery} placeholder="Buscar guia, paciente ou operadora..."><SelectFilter value={operadora} onChange={setOperadora} options={['Todas','Unimed','Amil','SulAmérica','Bradesco']} label="Operadora"/></Toolbar>
  <div className="metric-row"><Metric label="Guias auditadas" value="0"/><Metric label="Com glosa" value="0" warn/><Metric label="Sem glosa" value="0" positive/><Metric label="Taxa de aprovação" value="0%" positive/></div>
  <div className="page-card"><div className="card-title"><div><h2>Guias auditadas</h2><p>Valores apresentados, pagos e glosados</p></div><button className="outline compact"><Icon name="download"/>Exportar</button></div><DataTable heads={['Nº da guia','Paciente','Operadora','Tipo','Apresentado','Pago','Glosado','']} rows={filtered}/></div>
 </>;
}
