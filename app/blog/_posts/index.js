/* Registro dos artigos do blog. Artigo novo: criar o módulo nesta pasta
   (exportando `post` e o componente default) e incluí-lo aqui. A ordem
   da lista é a da página do blog — mais recente primeiro. */
import OQueEGlosa, { post as oQueEGlosa } from './o-que-e-glosa';
import TiposDeGlosa, { post as tiposDeGlosa } from './tipos-de-glosa';
import Tabela38Mudou, { post as tabela38Mudou } from './tabela-38-o-que-mudou-2026';
import Eleicoes2026, { post as eleicoes2026 } from './eleicoes-2026-planos-de-saude-clinicas';
import LeiGlosaAbusiva, { post as leiGlosaAbusiva } from './existe-lei-contra-glosa-abusiva';
import ReformaTributaria, { post as reformaTributaria } from './reforma-tributaria-2026-clinicas-glosa';
import Agenda2027, { post as agenda2027 } from './agenda-saude-suplementar-2027';
import ChecklistReceita, { post as checklistReceita } from './checklist-proteger-receita-mudanca-regulatoria';

export const POSTS = [
  { ...checklistReceita, Conteudo: ChecklistReceita },
  { ...agenda2027, Conteudo: Agenda2027 },
  { ...reformaTributaria, Conteudo: ReformaTributaria },
  { ...leiGlosaAbusiva, Conteudo: LeiGlosaAbusiva },
  { ...eleicoes2026, Conteudo: Eleicoes2026 },
  { ...tabela38Mudou, Conteudo: Tabela38Mudou },
  { ...oQueEGlosa, Conteudo: OQueEGlosa },
  { ...tiposDeGlosa, Conteudo: TiposDeGlosa },
];

export function postPorSlug(slug) {
  return POSTS.find((p) => p.slug === slug);
}
