/* Artigo informativo e apartidário sobre o debate eleitoral de 2026 e a
   saúde suplementar. Regra editorial: não avalia, não compara e não
   recomenda candidato. Só entra o que tem fonte; o que não foi encontrado
   é dito como "não encontrado". Revisado em 27/10/2026, após o 2º turno. */
import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';

const FONTE_OUTRA_SAUDE = 'https://outraspalavras.net/outrasaude/eleicoes-outra-saude-analisa-o-sus-nos-programas-dos-candidatos/';
const FONTE_AGENDA = 'https://futurodasaude.com.br/?p=42493';
const FONTE_PL1653 = 'https://www.camara.leg.br/propostas-legislativas/2613918';
const TSE = 'https://divulgacandcontas.tse.jus.br/';
const FONTE_TSE_2T = 'https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/presidente-do-tse-anuncia-reeleicao-de-lula-e-faz-balanco-do-2o-turno-das-eleicoes-2026';

export const post = {
  slug: 'eleicoes-2026-planos-de-saude-clinicas',
  titulo: 'Eleições 2026: o que o debate sobre saúde diz sobre planos de saúde e clínicas?',
  tituloSeo: 'Eleições 2026 e planos de saúde: o que muda para clínicas',
  descricao:
    'Levantamento informativo e sem posicionamento: o que as propostas de saúde das eleições 2026 abordam, o que não abordam sobre planos de saúde e glosa, e onde conferir os programas de governo.',
  publicado: '2026-10-10',
  atualizado: '2026-10-27',
  resposta: (
    <>
      <strong>No debate eleitoral de 2026, a saúde aparece sobretudo como tema do SUS.</strong> Nos levantamentos
      consultados até 10/10/2026, não foram encontradas propostas específicas sobre glosa, sobre a relação entre operadoras
      e prestadores ou sobre o padrão TISS. O assunto de planos de saúde chega à clínica mais pela agenda regulatória da
      ANS e do Congresso do que pelos programas de candidatos. O 2º turno ocorreu em 25/10/2026, e o TSE anunciou o resultado.
    </>
  ),
  perguntas: [
    {
      q: 'Algum candidato à Presidência propôs medidas contra glosa de convênio?',
      a: 'Nos levantamentos públicos consultados até 10/10/2026, não foi encontrada proposta específica sobre glosa. Para conferir você mesmo, leia o plano de governo registrado no Divulgação de Candidaturas do TSE e busque os termos “saúde suplementar”, “ANS”, “planos de saúde”, “prestadores” e “glosa”.',
    },
    {
      q: 'Este artigo recomenda ou critica algum candidato?',
      a: 'Não. O RecuperaGlosa é uma ferramenta de auditoria de glosas e este conteúdo é estritamente informativo: descreve o que foi publicado por fontes identificadas e o que a clínica pode acompanhar, sem juízo sobre candidatos ou partidos.',
    },
    {
      q: 'Uma eleição muda a regra de glosa da minha clínica?',
      a: 'Não diretamente. A relação entre operadora e prestador é regida por contrato e por normas da ANS, como a RN nº 503/2022. Mudanças vêm de resoluções da agência ou de lei aprovada pelo Congresso, processos que levam meses e têm consulta pública ou tramitação própria.',
    },
    {
      q: 'Quando saberemos o resultado e o que vem depois?',
      a: 'O 2º turno ocorreu em 25/10/2026 e o TSE anunciou o resultado. A agenda de saúde depende da composição do governo e do Congresso eleitos, que assumem a partir de janeiro de 2027. Até lá, as normas da ANS e os contratos vigentes seguem valendo.',
    },
  ],
};

const TH = { padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--line)' };
const TD = { padding: '8px 10px', verticalAlign: 'top', borderBottom: '1px solid var(--line)' };

export default function Conteudo() {
  return (
    <>
      <h2 id="situacao">Resultado da eleição</h2>
      <div className={s.fatos4}>
        <div className={s.fato}><small>1º turno</small><strong>04/10/2026</strong></div>
        <div className={s.fato}><small>2º turno</small><strong>25/10/2026</strong></div>
        <div className={s.fato}><small>Presidente eleito</small><strong>Lula (PT), 51,79%</strong></div>
        <div className={s.fato}><small>Dados até</small><strong>27/10/2026</strong></div>
      </div>
      <p>
        No 2º turno, segundo o <a href={FONTE_TSE_2T} target="_blank" rel="noopener noreferrer">anúncio do presidente do TSE</a>,
        Lula (PT) foi eleito com 51,79% dos votos válidos (64.256.232 votos), contra 48,21% de Flávio Bolsonaro (PL), com 59.826.041
        votos. Os percentuais e totais foram conferidos em cobertura da imprensa que reproduz o anúncio; a página do TSE não pôde ser
        aberta de forma automatizada na revisão, então confirme os números no portal de resultados do TSE. Este artigo não avalia
        nem compara as candidaturas: reúne o que foi publicado sobre saúde e mostra como a clínica pode conferir cada programa
        na fonte.
      </p>

      <h2 id="o-que-aparece">O que as análises de saúde destacam</h2>
      <p>
        Uma análise de setembro/2026 do <a href={FONTE_OUTRA_SAUDE} target="_blank" rel="noopener noreferrer">Outra Saúde</a> examinou
        os programas dos cinco candidatos com maior intenção de voto no período. Segundo o texto, o eixo comum é a promessa de
        ampliar o SUS, e o subfinanciamento do sistema é o ponto sem solução detalhada em nenhum deles. É uma leitura de um
        veículo específico, com recorte próprio, e deve ser lida como tal.
      </p>
      <p>
        Já o balanço da <a href={FONTE_AGENDA} target="_blank" rel="noopener noreferrer">agenda da saúde em ano eleitoral</a>, do
        Futuro da Saúde, indica que a política de preços e reajustes deve voltar à pauta da ANS. A agência aprovou em 17/07/2026
        a agenda regulatória 2026–2028, com 14 temas. Sobre o Legislativo, reportagem de 22/04/2026 registra que o setor avalia
        que o PL dos planos de saúde não deve ganhar grande destaque em 2026.
      </p>

      <h2 id="lacuna">O que não foi encontrado</h2>
      <p>
        Nas fontes consultadas, <strong>não há proposta específica sobre glosa</strong>, sobre prazo de pagamento a prestadores
        ou sobre o padrão TISS. Isso não significa que o tema esteja ausente de todos os programas, e sim que não apareceu nos
        levantamentos públicos disponíveis. Os planos completos ficam registrados no TSE.
      </p>

      <h2 id="conferir">Como conferir um programa de governo, passo a passo</h2>
      <ol className={s.passos}>
        <li>Acesse o <a href={TSE} target="_blank" rel="noopener noreferrer">Divulgação de Candidaturas do TSE</a> e escolha o cargo e o candidato.</li>
        <li>Abra o arquivo “Proposta de governo” (PDF).</li>
        <li>Use a busca do leitor de PDF para localizar: “saúde suplementar”, “ANS”, “plano de saúde”, “operadora”, “prestador”, “glosa”, “TISS”.</li>
        <li>Anote o trecho literal, a página e se é compromisso (com meta) ou diretriz genérica.</li>
        <li>Repita para cada candidato com o mesmo roteiro, para a comparação ser justa.</li>
      </ol>

      <h2 id="o-que-importa">O que realmente mexe na rotina de glosa</h2>
      <p>
        A relação entre operadora e clínica é definida por contrato e por normas infralegais. Os pontos que mais afetam a
        rotina, e que estão em movimento independentemente da eleição, são estes:
      </p>
      <div className={s.card} style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 520 }}>
          <thead>
            <tr><th style={TH}>Tema</th><th style={TH}>Onde está</th><th style={TH}>Situação informada</th></tr>
          </thead>
          <tbody>
            <tr>
              <td style={TD}>Regras de contrato, glosa e contestação</td>
              <td style={TD}>RN ANS nº 503/2022</td>
              <td style={TD}>Em vigor. Veja o artigo sobre <Link href="/blog/existe-lei-contra-glosa-abusiva">lei contra glosa abusiva</Link>.</td>
            </tr>
            <tr>
              <td style={TD}>Reajuste dos planos atrelado à qualidade</td>
              <td style={TD}><a href={FONTE_PL1653} target="_blank" rel="noopener noreferrer">PL 1653/2026</a> (Câmara)</td>
              <td style={TD}>Apresentado em 07/04/2026; na Comissão de Saúde, aguardando designação de relator (último andamento localizado: 19/05/2026). Confira a página da Câmara para o status atual.</td>
            </tr>
            <tr>
              <td style={TD}>Terminologia das glosas</td>
              <td style={TD}>Tabela 38 do padrão TISS</td>
              <td style={TD}>Revisada: <Link href="/blog/tabela-38-o-que-mudou-2026">o que mudou em 2026</Link>.</td>
            </tr>
            <tr>
              <td style={TD}>Tributação sobre serviços de saúde</td>
              <td style={TD}>EC 132/2023 e LC 214/2025</td>
              <td style={TD}>Em transição. Veja <Link href="/blog/reforma-tributaria-2026-clinicas-glosa">reforma tributária e glosa</Link>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Para o plano de ação da clínica independentemente do resultado, veja o{' '}
        <Link href="/blog/checklist-proteger-receita-mudanca-regulatoria">checklist para proteger a receita</Link> e a{' '}
        <Link href="/blog/agenda-saude-suplementar-2027">agenda da saúde suplementar para 2027</Link>.
      </p>
      <p>
        Revisão de 27/10/2026: desde 10/10/2026, não foi encontrada nas buscas realizadas nenhuma novidade verificável sobre
        glosa ou contratos com prestadores nos planos de governo. Novidades futuras entram com fonte e data.
      </p>
    </>
  );
}
