import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UploadForm from './UploadForm';

export const metadata = {
  title: 'Upload | RecuperaGlosa',
};

export const dynamic = 'force-dynamic';

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Buscar plano e contar lotes do mês
  const { data: usuario } = await supabase
    .from('usuario')
    .select('clinica_id')
    .eq('id', user.id)
    .single();

  const clinicaId = usuario?.clinica_id;

  const { data: clinica } = await supabase
    .from('clinica')
    .select('plano, nome')
    .eq('id', clinicaId)
    .single();

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const { count: lotesDoMes } = await supabase
    .from('lote')
    .select('*', { count: 'exact', head: true })
    .eq('clinica_id', clinicaId)
    .gte('criado_em', inicioMes);

  const isGratuito = clinica.plano !== 'ativo';
  const analisesRestantes = isGratuito ? 3 - lotesDoMes : null;
  const atingiuLimite = isGratuito && lotesDoMes >= 3;

  return (
    <main style={{ minHeight: '100vh', padding: '40px 20px', background: '#f5f8fb' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h1 style={{ marginTop: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
            📄 Enviar Demonstrativo
          </h1>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Clínica: <strong>{clinica.nome}</strong>
          </p>

          {isGratuito && (
            <div style={{
              padding: '12px 16px',
              background: analisesRestantes > 0 ? '#eaf7ef' : '#fee2e2',
              border: `1px solid ${analisesRestantes > 0 ? '#86efac' : '#fca5a5'}`,
              borderRadius: '8px',
              marginBottom: '24px',
              color: analisesRestantes > 0 ? '#166534' : '#991b1b',
              fontSize: '13px',
            }}>
              {analisesRestantes > 0 ? (
                <>✅ <strong>{analisesRestantes}</strong> análise{analisesRestantes !== 1 ? 's' : ''} gratuita{analisesRestantes !== 1 ? 's' : ''} restante{analisesRestantes !== 1 ? 's' : ''} este mês.</>
              ) : (
                <>❌ Você atingiu o limite de 3 análises gratuitas este mês. Assine para continuar.</>
              )}
            </div>
          )}

          {atingiuLimite ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
            }}>
              <h2 style={{ marginTop: 0, fontSize: '20px', color: '#334155' }}>Limite Atingido 🔒</h2>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Você já usou suas 3 análises gratuitas este mês.
              </p>
              <a
                href="#checkout"
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  padding: '12px 24px',
                  background: '#16a34a',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Assinar Agora
              </a>
            </div>
          ) : (
            <UploadForm clinicaId={clinicaId} isGratuito={isGratuito} />
          )}
        </div>
      </div>
    </main>
  );
}
