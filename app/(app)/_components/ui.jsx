'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Icon } from './Icon';

export function Toolbar({query='',setQuery=()=>{},placeholder,children}){return <div className="toolbar"><label><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={placeholder}/>{query&&<button type="button" className="clear-search" onClick={()=>setQuery('')} aria-label="Limpar busca"><Icon name="x" size={14}/></button>}</label><div className="toolbar-actions">{children}<button className="outline compact"><Icon name="filter"/>Filtros</button></div></div>}

export function SelectFilter({value,onChange,options,label}){return <label className="select-filter"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(option=><option key={option}>{option}</option>)}</select><Icon name="chevron" size={14}/></label>}

export function Metric({label,value,positive,warn}){return <div className="metric-card"><p>{label}</p><strong className={positive?'positive':warn?'warn':''}>{value}</strong><small>últimos 30 dias</small></div>}

export function Kpi({title,value,sub,icon,tone}){return <div className="kpi"><p>{title}</p><strong className="dark">{value}</strong><small>{sub}</small><span className={`kpi-icon ${tone}`}><Icon name={icon}/></span></div>}

export function ChartTooltip({active,payload,label}){if(!active||!payload?.length)return null;return <div className="chart-tooltip">{label&&<strong>{label}</strong>}{payload.map(item=><span key={item.dataKey||item.name} style={{color:item.color||item.payload?.color}}>{item.name}: {typeof item.value==='number'?item.value.toLocaleString('pt-BR'):item.value}</span>)}</div>}

export function Spark({data}){
 if(!data||data.length===0) return null;
 return <div className="spark-chart" aria-label="Evolução do valor recuperável"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{top:5,right:2,left:2,bottom:2}}><defs><linearGradient id="sparkFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity=".25"/><stop offset="100%" stopColor="#16A34A" stopOpacity="0"/></linearGradient></defs><Tooltip content={<ChartTooltip/>}/><Area type="monotone" dataKey="recuperavel" name="Recuperável" stroke="#16A34A" strokeWidth={2.3} fill="url(#sparkFade)" dot={false} activeDot={{r:4}}/></AreaChart></ResponsiveContainer></div>
}

export function Donut({data,large=false}){return <div className={`recharts-donut ${large?'is-large':''}`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={large?54:28} outerRadius={large?78:42} paddingAngle={1} stroke="#fff" strokeWidth={2}>{data.map(item=><Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip formatter={(value,name)=>[`${value}%`,name]} contentStyle={{border:'1px solid #e2e8f0',borderRadius:10,fontSize:11,boxShadow:'0 12px 30px rgba(15,23,42,.1)'}}/></PieChart></ResponsiveContainer>{large&&<div className="donut-label"><strong>100%</strong><span>das glosas</span></div>}</div>}

export function Legend({color,t,v}){return <div className="legend-row"><span className="dot" style={{background:color}}/><p>{t}</p><b>{v}</b></div>}

export function Status({text}){const cls=text.toLowerCase().replaceAll(' ','-').normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]','g'),'');return <em className={`status ${cls}`}>{text}</em>}

export function SimpleTable({heads,rows}){return <div className="simple-table"><div className="simple-row head">{heads.map(h=><span key={h}>{h}</span>)}</div>{rows.map((r,i)=><div className="simple-row" key={i}>{r.map((v,j)=><span key={j}>{v}</span>)}</div>)}</div>}

export function DataTable({heads,rows,pageSize=5}){const [page,setPage]=useState(1);const pages=Math.max(1,Math.ceil(rows.length/pageSize));const current=Math.min(page,pages);const visible=rows.slice((current-1)*pageSize,current*pageSize);return <><div className="data-table-wrap"><table className="data-table"><thead><tr>{heads.map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{visible.length?visible.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>):<tr><td colSpan={heads.length}><div className="empty-table"><Icon name="search"/><strong>Nenhum resultado encontrado</strong><span>Ajuste a busca ou os filtros.</span></div></td></tr>}</tbody></table></div><div className="pagination"><span>Mostrando {visible.length} de {rows.length} registros</span><div><button disabled={current===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>‹</button>{Array.from({length:pages},(_,i)=>i+1).map(p=><button className={p===current?'active':''} onClick={()=>setPage(p)} key={p}>{p}</button>)}<button disabled={current===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>›</button></div></div></>}

export function Field({label,value,placeholder}){return <label className="field"><span>{label}</span><input defaultValue={value} placeholder={placeholder}/></label>}

export function Toggle({title,sub}){const [on,setOn]=useState(true);return <div className="toggle-row"><div><b>{title}</b><p>{sub}</p></div><button type="button" aria-pressed={on} aria-label={`${on?'Desativar':'Ativar'} ${title}`} onClick={()=>setOn(!on)} className={`toggle ${on?'on':''}`}><span/></button></div>}
