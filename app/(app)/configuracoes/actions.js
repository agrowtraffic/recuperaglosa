'use server';

import { createClient } from '@/lib/supabase/server';
import { validarCNPJ } from '@/lib/validacao-cnpj';

export async function atualizarClinica(formData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Usuário não autenticado' };
  }

  // Buscar clinica_id do usuário
  const { data: usuario } = await supabase
    .from('usuario')
    .select('clinica_id')
    .eq('id', user.id)
    .single();

  if (!usuario) {
    return { error: 'Clínica não encontrada' };
  }

  const nome = formData.get('nome')?.trim();
  const cnpj = formData.get('cnpj')?.trim() || '';
  const responsavelNome = formData.get('responsavel_nome')?.trim() || '';
  const responsavelConselho = formData.get('responsavel_conselho')?.trim() || '';
  const responsavelRegistro = formData.get('responsavel_registro')?.trim() || '';
  const responsavelUf = formData.get('responsavel_uf')?.trim().toUpperCase() || '';
  const cnes = formData.get('cnes')?.trim() || '';
  const codigoPrestador = formData.get('codigo_prestador')?.trim() || '';

  // Validações
  if (!nome || nome.length < 2) {
    return { error: 'Nome da clínica deve ter pelo menos 2 caracteres' };
  }

  if (!validarCNPJ(cnpj)) {
    return { error: 'CNPJ inválido (deve ter 14 dígitos ou estar em branco)' };
  }

  if (responsavelUf && responsavelUf.length !== 2) {
    return { error: 'UF do conselho deve ter 2 letras (ex: SP)' };
  }

  // Atualizar na tabela clinica
  const { error: updateError } = await supabase
    .from('clinica')
    .update({
      nome: nome,
      cnpj: cnpj || null,
      responsavel_nome: responsavelNome || null,
      responsavel_conselho: responsavelConselho || null,
      responsavel_registro: responsavelRegistro || null,
      responsavel_uf: responsavelUf || null,
      cnes: cnes || null,
      codigo_prestador: codigoPrestador || null,
    })
    .eq('id', usuario.clinica_id);

  if (updateError) {
    console.error('Erro ao atualizar clínica:', updateError);
    return { error: 'Não foi possível salvar as alterações' };
  }

  return { success: true, nome, cnpj };
}
