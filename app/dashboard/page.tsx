'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

interface GlosaRow {
  clinica_id: string;
  lote_id: string;
  codigo_glosa: string | null;
  motivo_glosa: string;
  qtd_itens: number;
  total_glosado: number;
}

export default function DashboardPage() {
  const [glosas, setGlosas] = useState<GlosaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGlosado, setTotalGlosado] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchGlosas = async () => {
      try {
        // Verify auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        // Fetch glosas by motivo from view
        const { data, error } = await supabase
          .from('v_glosa_por_motivo')
          .select('*')
          .order('total_glosado', { ascending: false });

        if (error) throw error;
        setGlosas(data || []);
        setTotalGlosado(data?.reduce((sum, row) => sum + (row.total_glosado || 0), 0) || 0);
      } catch (err) {
        console.error('Erro ao carregar glosas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlosas();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard de Glosas</h1>
        <button
          onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </div>

      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
      }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '0.5rem' }}>Total glosado</p>
        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2a78d6' }}>
          R$ {totalGlosado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Glosas por motivo</h2>
      {glosas.length === 0 ? (
        <p style={{ color: '#666' }}>Nenhuma glosa encontrada.</p>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #ddd',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Motivo</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Qtd. Itens</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Total Glosado</th>
            </tr>
          </thead>
          <tbody>
            {glosas.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '1rem' }}>{row.motivo_glosa || 'Sem motivo'}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{row.qtd_itens}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>
                  R$ {(row.total_glosado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
