/* ============================================================
   Harness local do PDF de recurso.

   Renderiza RecursoPDF.tsx direto, sem banco, sem servidor Next.
   Gera casos de borda que a rota real dificilmente cobre num teste
   manual: guia com 1 item, com vários motivos misturados, com texto
   longo, com muitos itens (quebra de página), e com dados ausentes
   (clínica sem responsável técnico cadastrado).

   Rodar: npx tsx src/testar-pdf.tsx
   Saída: scratchpad/pdf-teste/*.pdf (fora do repo, ver caminho abaixo)
   ============================================================ */
import { writeFileSync, mkdirSync } from 'node:fs';
import { renderToBuffer } from '@react-pdf/renderer';
import { RecursoPDF, type RecursoPDFProps, type GrupoMotivoPDF } from '../components/pdf/RecursoPDF';
import { MOTIVOS } from './tiss/motivos';

const SAIDA = 'C:/Users/henri/AppData/Local/Temp/claude/C--code/b3ce9ddd-2f36-453e-884b-9e5a9478ebda/scratchpad/pdf-teste';
mkdirSync(SAIDA, { recursive: true });

const brl = (n: number) =>
  `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function grupo(codigo: string, itens: { procedimento: string; apresentado: number; pago: number; glosado: number }[]): GrupoMotivoPDF {
  const m = MOTIVOS[codigo];
  const subtotal = itens.reduce((s, i) => s + i.glosado, 0);
  return {
    codigoGlosa: codigo,
    motivoDescricao: m?.descricao ?? `Código ${codigo}`,
    argumento: m?.argumento ?? '—',
    subtotal: brl(subtotal),
    itens: itens.map((i) => ({
      procedimento: i.procedimento,
      apresentado: brl(i.apresentado),
      pago: brl(i.pago),
      glosado: brl(i.glosado),
    })),
  };
}

const base = {
  clinicaNome: 'Clínica Odontológica Sorriso Pleno Ltda',
  clinicaCnpj: '12.345.678/0001-90',
  operadora: 'ODONTO PREV SAÚDE',
  registroAns: '417823',
  competencia: '2026-06',
  numeroDemonstrativo: 'DEM-2026-0475',
  numeroGuia: 'G-2026-0475',
  beneficiario: 'Maria Aparecida Souza',
  carteira: '4178230011992',
  dataAtendimento: '09/06/2026',
  dataEmissao: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
  protocolo: 'A1B2C3D4',
} satisfies Partial<RecursoPDFProps>;

const casos: Record<string, RecursoPDFProps> = {
  /* 1) Caso mínimo: 1 item, 1 motivo, com responsável técnico completo */
  '01-minimo': {
    ...base,
    responsavelNome: 'Dra. Ana Paula Ribeiro',
    responsavelConselho: 'CRO',
    responsavelRegistro: '54321',
    responsavelUf: 'SP',
    responsavelCnes: '2077469',
    grupos: [
      grupo('1402', [
        { procedimento: '81000103 — Tratamento endodôntico em dente permanente birradicular', apresentado: 680, pago: 0, glosado: 680 },
      ]),
    ],
    valorTotal: brl(680),
  },

  /* 2) Vários motivos na mesma guia — o caso que estava quebrado antes */
  '02-varios-motivos': {
    ...base,
    responsavelNome: 'Dra. Ana Paula Ribeiro',
    responsavelConselho: 'CRO',
    responsavelRegistro: '54321',
    responsavelUf: 'SP',
    responsavelCnes: '2077469',
    grupos: [
      grupo('1402', [
        { procedimento: '81000103 — Tratamento endodôntico em dente permanente birradicular', apresentado: 680, pago: 0, glosado: 680 },
        { procedimento: '84000201 — Coroa total em cerâmica pura — dente 21', apresentado: 1250, pago: 0, glosado: 1250 },
      ]),
      grupo('3007', [
        { procedimento: '85200157 — Restauração em resina composta — dente 26', apresentado: 190, pago: 0, glosado: 190 },
        { procedimento: '85200157 — Restauração em resina composta — dente 36', apresentado: 190, pago: 0, glosado: 190 },
      ]),
      grupo('2601', [
        { procedimento: '81000200 — Retratamento endodôntico em dente permanente', apresentado: 420, pago: 210, glosado: 210 },
      ]),
    ],
    valorTotal: brl(680 + 1250 + 190 + 190 + 210),
  },

  /* 3) Sem responsável técnico cadastrado — deve sair com linha em branco, não quebrar */
  '03-sem-responsavel-tecnico': {
    ...base,
    grupos: [
      grupo('1702', [
        { procedimento: '85200157 — Restauração em resina composta — dente 16, face oclusal', apresentado: 190, pago: 0, glosado: 190 },
      ]),
    ],
    valorTotal: brl(190),
  },

  /* 4) Texto longo — descrição e argumento nos limites do que a Tabela 38 traz */
  '04-texto-longo': {
    ...base,
    beneficiario: 'Maria Aparecida da Silva Nascimento Rodrigues Fernandes de Oliveira',
    responsavelNome: 'Dr. José Carlos Alexandre de Souza Barbosa Neto Filho',
    responsavelConselho: 'CRO',
    responsavelRegistro: '123456',
    responsavelUf: 'SP',
    responsavelCnes: '2077469',
    grupos: [
      grupo('1438', [
        {
          procedimento: '31009024 — Reabilitação protética total sobre implantes com estrutura metálica fundida, incluindo componentes protéticos parafusados',
          apresentado: 4800,
          pago: 0,
          glosado: 4800,
        },
      ]),
    ],
    valorTotal: brl(4800),
  },

  /* 5) Muitos itens — testa quebra de página e o `fixed` do rodapé */
  '05-muitos-itens': {
    ...base,
    responsavelNome: 'Dra. Ana Paula Ribeiro',
    responsavelConselho: 'CRO',
    responsavelRegistro: '54321',
    responsavelUf: 'SP',
    grupos: [
      grupo(
        '3007',
        Array.from({ length: 22 }, (_, i) => ({
          procedimento: `8520015${i % 10} — Restauração em resina composta — dente ${11 + i}, face ${['oclusal', 'mesial', 'distal', 'vestibular'][i % 4]}`,
          apresentado: 190,
          pago: 0,
          glosado: 190,
        })),
      ),
      grupo(
        '1402',
        Array.from({ length: 14 }, (_, i) => ({
          procedimento: `8100010${i % 10} — Tratamento endodôntico — dente ${21 + i}`,
          apresentado: 420,
          pago: 0,
          glosado: 420,
        })),
      ),
    ],
    valorTotal: brl(22 * 190 + 14 * 420),
  },

  /* 6) Código de glosa fora da Tabela 38 — operadora com código próprio */
  '06-codigo-nao-oficial': {
    ...base,
    responsavelNome: 'Dra. Ana Paula Ribeiro',
    responsavelConselho: 'CRO',
    responsavelRegistro: '54321',
    responsavelUf: 'SP',
    grupos: [
      grupo('9876', [
        { procedimento: '81000103 — Tratamento endodôntico em dente permanente birradicular', apresentado: 680, pago: 0, glosado: 680 },
      ]),
    ],
    valorTotal: brl(680),
  },

  /* 7) Campos opcionais todos ausentes (sem registro ANS, sem demonstrativo, sem carteira) */
  '07-campos-minimos': {
    clinicaNome: 'Consultório Dr. João',
    clinicaCnpj: '00.000.000/0001-00',
    operadora: 'OPERADORA SEM REGISTRO INFORMADO',
    numeroGuia: 'G-0001',
    dataEmissao: base.dataEmissao,
    grupos: [grupo('1801', [{ procedimento: '— — Procedimento sem código TUSS', apresentado: 100, pago: 0, glosado: 100 }])],
    valorTotal: brl(100),
  },
};

async function main() {
  for (const [nome, props] of Object.entries(casos)) {
    const buffer = await renderToBuffer(RecursoPDF(props));
    const caminho = `${SAIDA}/${nome}.pdf`;
    writeFileSync(caminho, buffer as any);
    console.log(`✓ ${nome}.pdf  (${(buffer.length / 1024).toFixed(0)} KB, ${props.grupos.length} grupo(s), ${props.grupos.reduce((s, g) => s + g.itens.length, 0)} item(ns))`);
  }
  console.log(`\nGerados em: ${SAIDA}`);
}

main().catch((e) => {
  console.error('FALHOU:', e);
  process.exit(1);
});
