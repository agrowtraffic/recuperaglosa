import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function criarUsuarioTeste() {
  try {
    // 1. Criar usuário em auth.users
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email: 'teste@recuperaglosa.com',
      password: 'TesteSeguro123!',
      email_confirm: true,
      user_metadata: { nome: 'Usuário Teste' },
    });

    if (authError) throw new Error(`Auth error: ${authError.message}`);
    if (!user) throw new Error('Usuário não criado');

    console.log(`✅ Usuário criado: ${user.user.id}`);

    // 2. Obter ou criar uma clínica
    const { data: clinicas } = await supabase
      .from('clinica')
      .select('id')
      .limit(1);

    let clinicaId: string;
    if (clinicas && clinicas.length > 0) {
      clinicaId = clinicas[0].id;
      console.log(`✅ Usando clínica existente: ${clinicaId}`);
    } else {
      const { data: novaCli, error: cliError } = await supabase
        .from('clinica')
        .insert({ nome: 'Clínica Teste Recupera Glosa' })
        .select()
        .single();

      if (cliError) throw new Error(`Clinic error: ${cliError.message}`);
      clinicaId = novaCli.id;
      console.log(`✅ Clínica criada: ${clinicaId}`);
    }

    // 3. Vincular usuário à clínica
    const { error: userError } = await supabase
      .from('usuario')
      .insert({
        id: user.user.id,
        clinica_id: clinicaId,
        email: user.user.email,
        role: 'owner',
      });

    if (userError) throw new Error(`Usuario table error: ${userError.message}`);

    console.log(`✅ Usuário vinculado à clínica!`);
    console.log(`\nDados de teste:`);
    console.log(`Email: teste@recuperaglosa.com`);
    console.log(`Senha: TesteSeguro123!`);
    console.log(`Clínica ID: ${clinicaId}`);
    console.log(`Usuário ID: ${user.user.id}`);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

criarUsuarioTeste();
