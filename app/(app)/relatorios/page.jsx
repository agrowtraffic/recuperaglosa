'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '../_components/Icon';
import { Metric } from '../_components/ui';

export default function RelatoriosPage(){
 const [periodo,setPeriodo]=useState('30 dias');

 return <>
  <div className="content-head"><div><h1>Relatórios</h1><p>Entenda a evolução financeira e os principais motivos</p></div><Link href="/upload" className="primary"><Icon name="plus"/>Novo upload</Link></div>
  <div className="report-head"><div className="segmented">{['30 dias','3 meses','12 meses'].map(p=><button key={p} className={periodo===p?'active':''} onClick={()=>setPeriodo(p)}>Últimos {p}</button>)}</div><button className="outline compact"><Icon name="download"/>Exportar PDF</button></div>
  <div className="metric-row"><Metric label="Valor apresentado" value="R$ 0,00"/><Metric label="Valor pago" value="R$ 0,00"/><Metric label="Valor glosado" value="R$ 0,00" warn/><Metric label="Recuperado" value="R$ 0,00" positive/></div>
  <div className="report-grid"><div className="page-card chart-card"><div className="card-title"><div><h2>Evolução do valor recuperável</h2><p>Comparativo mensal — {periodo}</p></div></div><div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'#999'}}>Nenhum dado disponível</div></div><div className="page-card"><div className="card-title"><div><h2>Motivos de glosa</h2><p>Participação no valor total</p></div></div><div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'#999'}}>Nenhum dado disponível</div></div></div>
 </>;
}
