/* ============================================================
   /demonstracao — o resultado do produto, sem login.

   Lê o mesmo arquivo de exemplo do botão "Analisar um exemplo" e passa
   pelo mesmo parser e gerador de recurso. Não recebe arquivo nem grava
   nada no banco a partir daqui.
   ============================================================ */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import PaginaPublica, { CADASTRO } from '@/app/_components/publico/PaginaPublica';
import s from '@/app/_components/publico/publico.module.css';
import { OG_IMAGE, breadcrumb, jsonLd } from '@/lib/seo';
import { parseDemonstrativo, glosaPorMotivo, valorRecorrivel } from '@/src/tiss/parser';
import { gerarRecurso } from '@/src/tiss/recurso';

const TITULO = 'Demonstração: análise de glosas de um XML TISS';
const DESCRICAO =
  'Veja sem cadastro como o RecuperaGlosa mostra valor apresentado, pago e glosado, os motivos de glosa e o recurso redigido. Exemplo com dados fictícios.';

export const metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: '/demonstracao' },
  openGraph: { title: TITULO, description: DESCRICAO, url: '/demonstracao', type: 'website', images: [OG_IMAGE] },
};

const WHATSAPP = 'https://wa.me/5511977315655';
const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function Demonstracao() {
  const xml = await readFile(path.join(process.cwd(), 'public/exemplos/demonstrativo-exemplo.xml'), 'utf8');
  const lote = { ...parseDemonstrativo(xml), operadora: 'Operadora de exemplo' };
  const motivos = glosaPorMotivo(lote);
  const recorrivel = valorRecorrivel(lote);
  const recurso = lote.guias
    .map((g) => gerarRecurso(g, lote, { nome: 'Clínica Exemplo' }))
    .find(Boolean);

  /* Trecho: do cabeçalho até a contestação do primeiro item. O restante é
     o que a pessoa vê com o próprio arquivo. */
  const linhas = recurso?.texto.split('\n') ?? [];
  const fim = linhas.findIndex((l) => l.trim().startsWith('Contestação:'));
  const trecho = linhas.slice(0, fim > -1 ? fim + 1 : 20).join('\n');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [breadcrumb([['Início', '/'], ['Demonstração', '/demonstracao']])],
  };

  return (
    <PaginaPublica>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <article className={s.article}>
        <span className={s.eyebrow}>Demonstração sem cadastro</span>
        <h1>Veja o resultado de um demonstrativo analisado</h1>

        <div className={s.alerta}>
          <p><strong>Exemplo com dados fictícios.</strong> Operadora, pacientes, guias e valores foram inventados para mostrar o produto.</p>
        </div>

        <div className={s.fatos4}>
          <div className={s.fato}><small>Apresentado</small><strong>{brl(lote.totalApresentado)}</strong></div>
          <div className={s.fato}><small>Pago</small><strong>{brl(lote.totalPago)}</strong></div>
          <div className={s.fato}><small>Glosado</small><strong>{brl(lote.totalGlosado)}</strong></div>
          <div className={s.fato}><small>Com tese de recurso</small><strong>{brl(recorrivel)}</strong></div>
        </div>

        <h2>Glosas por motivo</h2>
        <ul className={s.lista}>
          {motivos.map((m) => (
            <li key={m.codigo}>
              <Link href={`/codigos-de-glosa/${m.codigo}`}>
                <b>{m.codigo}</b>
                <span>
                  {m.motivo}
                  <br />
                  <strong>{brl(m.total)}</strong>{' '}
                  <span className={m.recorrivel ? s.seloRecorrer : s.seloSem}>
                    {m.recorrivel ? 'Cabe recurso' : 'Sem recurso indicado'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {recurso && (
          <>
            <h2>Trecho do recurso redigido</h2>
            <div className={s.modelo}>{`${trecho}\n\n[…]`}</div>
            <p className={s.aviso}>O texto é um ponto de partida: a clínica revisa antes de enviar, e a decisão é da operadora.</p>
          </>
        )}

        <section className={s.cta}>
          <h2>Agora com o seu demonstrativo</h2>
          <p>Crie a conta e envie o XML TISS que a operadora disponibiliza.</p>
          <div className={s.ctaAcoes}>
            <Link className={s.button} href={CADASTRO}>Analisar meu XML grátis →</Link>
            <a className={s.buttonGhost} href={WHATSAPP} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </div>
          <p className={s.ctaNota}>3 análises por mês no plano grátis · sem cartão de crédito</p>
        </section>
      </article>
    </PaginaPublica>
  );
}
