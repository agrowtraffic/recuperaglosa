/* Registro dos artigos do blog. Artigo novo: criar o módulo nesta pasta
   (exportando `post` e o componente default) e incluí-lo aqui. A ordem
   da lista é a da página do blog — mais recente primeiro. */
import OQueEGlosa, { post as oQueEGlosa } from './o-que-e-glosa';
import TiposDeGlosa, { post as tiposDeGlosa } from './tipos-de-glosa';
import Tabela38Mudou, { post as tabela38Mudou } from './tabela-38-o-que-mudou-2026';

export const POSTS = [
  { ...tabela38Mudou, Conteudo: Tabela38Mudou },
  { ...oQueEGlosa, Conteudo: OQueEGlosa },
  { ...tiposDeGlosa, Conteudo: TiposDeGlosa },
];

export function postPorSlug(slug) {
  return POSTS.find((p) => p.slug === slug);
}
