-- ============================================================
-- Bucket de armazenamento dos XMLs originais, finalmente existindo.
--
-- O código sempre usou .from('demonstrativos'), mas o bucket no banco se
-- chamava 'demostrativos' (sem o 'n'). O upload não abortava no erro de
-- storage — só logava e seguia salvando o lote no banco normalmente —
-- então todo upload feito até hoje falhou em silêncio ao arquivar o XML
-- original. Zero arquivos no bucket antigo confirmam isso.
--
-- Privado, não público: o XML tem nome de beneficiário — dado de saúde,
-- sensível por LGPD. RLS por pasta: o path de upload é
-- `${clinica_id}/${timestamp}-${nome}`, então basta comparar o primeiro
-- segmento do caminho com a clínica do usuário logado, o mesmo padrão
-- que minha_clinica() usa nas tabelas.
--
-- O bucket antigo 'demostrativos' (com o typo) não foi removido: está
-- vazio e removê-lo é decisão do dono do projeto, não algo que decido
-- sozinho.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('demonstrativos', 'demonstrativos', false)
on conflict (id) do nothing;

create policy "clinica le so a propria pasta"
on storage.objects for select
to authenticated
using (
  bucket_id = 'demonstrativos'
  and (storage.foldername(name))[1] = (select clinica_id::text from usuario where id = auth.uid())
);

create policy "clinica escreve so na propria pasta"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'demonstrativos'
  and (storage.foldername(name))[1] = (select clinica_id::text from usuario where id = auth.uid())
);
