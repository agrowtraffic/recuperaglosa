'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Metric, DataTable } from '../_components/ui';

const CORES = ['#16A34A', '#006445', '#F97316', '#7185A6', '#DC2626', '#0284C7', '#9333EA', '#EA580C'];

export default function RelatóriosClient({ periodo, kpis, evolucao, motivos }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodo = (novoPeriodo) => {
    const params = new URLSearchParams(searchParams);
    params.set('periodo', novoPeriodo);
    router.push(`/relatorios?${params.toString()}`);
  };

  const periodoLabels = { '30': 'Últimos 30 dias', '90': 'Últimos 90 dias', '365': 'Últimos 365 dias' };
  const periodoLabel = periodoLabels[periodo] || 'Últimos 90 dias';

  // Preparar dados para gráfico de motivos
  const motivosData = (motivos || []).slice(0, 5).map((m, i) => ({
    name: m.motivo_glosa || '—',
    value: m.total_glosado || 0,
    color: CORES[i % CORES.length],
  }));

  const totalMotivos = motivosData.reduce((s, m) => s + m.value, 0);

  // Tabela de motivos
  const motivosRows = (motivos || []).slice(0, 10).map(m => [
    m.codigo_glosa || '—',
    m.motivo_glosa || '—',
    String(m.qtd_itens || 0),
    `R$ ${(m.total_glosado || 0).toFixed(2).replace('.', ',')}`,
  ]);

  // Taxa de recuperação
  const taxaRecuperacao = kpis.totalApresentado > 0
    ? Math.round(((kpis.totalApresentado - kpis.totalGlosado) / kpis.totalApresentado) * 100)
    : 0;

  return (
    <>
      <div className="report-head">
        <div className="segmented">
          {['30', '90', '365'].map(p => (
            <button
              key={p}
              className={periodo === p ? 'active' : ''}
              onClick={() => handlePeriodo(p)}
            >
              {periodoLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="metric-row">
        <Metric label="Valor apresentado" value={`R$ ${kpis.totalApresentado.toFixed(2).replace('.', ',')}`} />
        <Metric label="Valor pago" value={`R$ ${kpis.totalPago.toFixed(2).replace('.', ',')}`} positive />
        <Metric label="Valor glosado" value={`R$ ${kpis.totalGlosado.toFixed(2).replace('.', ',')}`} warn />
        <Metric label="Taxa aprovação" value={`${taxaRecuperacao}%`} positive />
      </div>

      <div className="report-grid">
        <div className="page-card chart-card">
          <div className="card-title">
            <div>
              <h2>Evolução do valor recuperável</h2>
              <p>Comparativo mensal — {periodoLabel}</p>
            </div>
          </div>
          {evolucao.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12 }}
                  formatter={(mes) => new Date(mes).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`}
                  labelFormatter={(mes) => new Date(mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                />
                <Legend />
                <Line type="monotone" dataKey="glosado" stroke="#DC2626" name="Glosado" strokeWidth={2} />
                <Line type="monotone" dataKey="pago" stroke="#16A34A" name="Pago" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="page-card">
          <div className="card-title">
            <div>
              <h2>Motivos de glosa</h2>
              <p>Participação no valor total</p>
            </div>
          </div>
          {motivosData.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={motivosData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => {
                    const pct = totalMotivos > 0 ? Math.round((value / totalMotivos) * 100) : 0;
                    return `${pct}%`;
                  }}
                >
                  {motivosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            {motivosData.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: m.color, borderRadius: '2px' }} />
                <span style={{ flex: 1, color: '#666' }}>{m.name.slice(0, 40)}</span>
                <strong>R$ {m.value.toFixed(2).replace('.', ',')}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {motivosRows.length > 0 && (
        <div className="page-card">
          <div className="card-title">
            <div>
              <h2>Detalhamento de motivos</h2>
              <p>Todos os motivos de glosa identificados</p>
            </div>
            <Link href="/glosas" className="outline compact">Ver glosas</Link>
          </div>
          <DataTable
            heads={['Código', 'Motivo', 'Qtd', 'Total']}
            rows={motivosRows}
          />
        </div>
      )}
    </>
  );
}
