const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Faltam variáveis NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

async function validateRelatorios() {
  try {
    console.log('🔍 Validando estrutura de dados para Relatórios...\n');

    // Query 1: Primeiros registros de guia para entender estrutura
    console.log('📊 Query 1: Amostra de dados da tabela guia');
    const { data: sample, error: sampleError } = await supabase
      .from('guia')
      .select('data_atendimento, valor_apresentado, valor_pago, valor_glosado')
      .limit(3);

    if (sampleError) {
      console.log('❌ Erro ao acessar guia:', sampleError.message);
    } else {
      console.log('✅ Tabela guia acessível. Amostra:');
      console.log(JSON.stringify(sample, null, 2));
    }

    console.log('\n---\n');

    // Query 2: Motivos de glosa (view)
    console.log('📊 Query 2: Motivos de glosa (v_glosa_por_motivo)');
    const { data: motivos, error: motivosError } = await supabase
      .from('v_glosa_por_motivo')
      .select('*')
      .limit(5);

    if (motivosError) {
      console.log('❌ Erro:', motivosError.message);
    } else {
      console.log('✅ View v_glosa_por_motivo acessível. Resultado:');
      console.log(JSON.stringify(motivos, null, 2));
    }

    console.log('\n---\n');

    // Query 3: Contar registros para scale
    console.log('📊 Query 3: Count de registros');
    const { count: guiasCount, error: countError } = await supabase
      .from('guia')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erro:', countError.message);
    } else {
      console.log('✅ Total de guias:', guiasCount);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

validateRelatorios();
