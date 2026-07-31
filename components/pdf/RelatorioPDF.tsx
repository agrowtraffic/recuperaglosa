import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

/* ============================================================
   RELATÓRIO DE GLOSAS — versão imprimível da tela /relatorios.

   Mesma paleta e mesmo vocabulário visual do RecursoPDF: os dois saem
   da mesma clínica e costumam ir para a mesma pasta. react-pdf não lê
   CSS var, então os hex ficam fixos aqui — se a marca mudar, atualizar
   junto com RecursoPDF.tsx e styles/tokens.css.

   Todos os valores chegam já formatados como texto. Formatar aqui dentro
   espalharia a regra de arredondamento por mais um lugar, e o número do
   PDF precisa bater exatamente com o da tela.
   ============================================================ */
const COLORS = {
  brand: '#073b32',
  paper: '#fffef9',
  ink900: '#10231f',
  ink800: '#17302b',
  ink600: '#3d5751',
  ink400: '#61706c',
  ink300: '#9aa9a4',
  line: '#dce5df',
  lineSoft: '#eaf0ec',
  canvas: '#f4f6ef',
  recuperado: '#0b9a73',
  recuperadoH: '#08765a',
  recuperadoBg: '#e8f7f0',
  glosado: '#e36d45',
  glosadoH: '#ad5334',
  glosadoBg: '#fff0e9',
};

const styles = StyleSheet.create({
  page: {
    padding: '30 34 70',
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.ink800,
    lineHeight: 1.4,
  },

  /* Cabeçalho */
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  clinicaRow: { flexDirection: 'row', alignItems: 'center', maxWidth: 300 },
  logo: { width: 30, height: 30, borderRadius: 15, marginRight: 9 },
  clinicaNome: { fontSize: 13, fontWeight: 700, color: COLORS.brand },
  clinicaCnpj: { fontSize: 7.5, color: COLORS.ink400, marginTop: 2 },
  docBox: { alignItems: 'flex-end' },
  docTitulo: { fontSize: 8.5, fontWeight: 700, color: COLORS.paper, backgroundColor: COLORS.brand, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 3, letterSpacing: 0.5 },
  docSub: { fontSize: 7, color: COLORS.ink400, textAlign: 'right', marginTop: 4 },
  divider: { height: 2, backgroundColor: COLORS.brand, marginBottom: 16 },

  periodo: { fontSize: 8.5, color: COLORS.ink600, marginBottom: 16 },
  periodoForte: { fontWeight: 700, color: COLORS.ink800 },

  sectionLabel: { fontSize: 7, fontWeight: 700, color: COLORS.brand, marginBottom: 6, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 },

  /* Cartões de número */
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  kpi: { width: '25%', paddingRight: 8, marginBottom: 10 },
  kpiLabel: { fontSize: 6.8, color: COLORS.ink400, textTransform: 'uppercase', letterSpacing: 0.4 },
  kpiValor: { fontSize: 13, fontWeight: 700, color: COLORS.ink900, marginTop: 2 },
  kpiAjuda: { fontSize: 6.8, color: COLORS.ink300, marginTop: 1 },

  destaqueBox: { backgroundColor: COLORS.recuperadoBg, borderLeftWidth: 3, borderLeftColor: COLORS.recuperado, borderRadius: 3, padding: 11, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  destaqueLabel: { fontSize: 7, fontWeight: 700, color: COLORS.recuperadoH, textTransform: 'uppercase', letterSpacing: 0.5 },
  destaqueValor: { fontSize: 19, fontWeight: 700, color: COLORS.recuperadoH, marginTop: 2 },
  destaqueNota: { fontSize: 7.5, color: COLORS.ink600, textAlign: 'right', maxWidth: 220, lineHeight: 1.4 },

  /* Tabelas */
  tableHead: { flexDirection: 'row', backgroundColor: COLORS.ink800, padding: 6, borderRadius: 2 },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 0.6, borderBottomColor: COLORS.lineSoft },
  tableRowAlt: { backgroundColor: COLORS.canvas },
  th: { fontSize: 7, fontWeight: 700, color: COLORS.paper, textTransform: 'uppercase' },
  td: { fontSize: 8.3, color: COLORS.ink800 },
  tdFraco: { fontSize: 8.3, color: COLORS.ink300 },
  tabela: { marginBottom: 14 },

  vazio: { fontSize: 8, color: COLORS.ink400, fontStyle: 'italic', paddingVertical: 8 },

  /* Rodapé fixo */
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 42, backgroundColor: COLORS.brand, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 34, justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, fontWeight: 700, color: COLORS.paper },
  footerUrl: { fontSize: 6.5, color: '#a7bdb5', marginTop: 1 },
  footerPage: { fontSize: 7, color: '#a7bdb5' },
});

export type LinhaOperadoraPDF = {
  operadora: string;
  glosado: string;
  lotes: number;
};

export type LinhaDesempenhoPDF = {
  operadora: string;
  recuperado: string;
  /* null vira "—": sem recurso decidido não existe taxa, e 0% leria
     como "essa operadora nunca aceita nada". */
  taxaValor: number | null;
  ganhos: number;
  decididos: number;
  aguardando: number;
  diasMedios: number | null;
};

export type LinhaFilaPDF = {
  guia: string;
  operadora: string;
  enviadoEm: string;
  valor: string;
  diasEsperando: number | null;
};

export type LinhaCompetenciaPDF = {
  competencia: string;
  apresentado: string;
  pago: string;
  glosado: string;
};

export type RelatorioPDFProps = {
  clinicaNome: string;
  clinicaCnpj: string;
  clinicaLogoUrl?: string | null;

  periodo: string;
  dataEmissao: string;

  apresentado: string;
  recebido: string;
  glosado: string;
  recuperado: string;
  recuperavel: string;
  perdido: string;
  emRecurso: string;

  qtdGuias: number;
  qtdLotes: number;

  taxaValor: number | null;
  ganhos: number;
  decididos: number;

  porOperadora: LinhaOperadoraPDF[];
  desempenho: LinhaDesempenhoPDF[];
  fila: LinhaFilaPDF[];
  porCompetencia: LinhaCompetenciaPDF[];
};

function Kpi({ label, valor, ajuda }: { label: string; valor: string; ajuda?: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValor}>{valor}</Text>
      {ajuda ? <Text style={styles.kpiAjuda}>{ajuda}</Text> : null}
    </View>
  );
}

export function RelatorioPDF(p: RelatorioPDFProps) {
  const temRecursoDecidido = p.decididos > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.topBar}>
          <View style={styles.clinicaRow}>
            {p.clinicaLogoUrl ? <Image src={p.clinicaLogoUrl} style={styles.logo} /> : null}
            <View>
              <Text style={styles.clinicaNome}>{p.clinicaNome}</Text>
              <Text style={styles.clinicaCnpj}>CNPJ {p.clinicaCnpj}</Text>
            </View>
          </View>
          <View style={styles.docBox}>
            <Text style={styles.docTitulo}>RELATÓRIO DE GLOSAS</Text>
            <Text style={styles.docSub}>Emitido em {p.dataEmissao}</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <Text style={styles.periodo}>
          Período: <Text style={styles.periodoForte}>{p.periodo}</Text>
          {'  ·  '}
          {p.qtdLotes} {p.qtdLotes === 1 ? 'demonstrativo' : 'demonstrativos'}
          {'  ·  '}
          {p.qtdGuias} {p.qtdGuias === 1 ? 'guia' : 'guias'}
        </Text>

        {/* O número que justifica a assinatura vem primeiro. */}
        <View style={styles.destaqueBox}>
          <View>
            <Text style={styles.destaqueLabel}>Recuperado</Text>
            <Text style={styles.destaqueValor}>{p.recuperado}</Text>
          </View>
          <Text style={styles.destaqueNota}>
            {temRecursoDecidido
              ? `${p.ganhos} de ${p.decididos} recursos aceitos pelas operadoras`
              : 'Nenhum recurso decidido pelas operadoras até esta emissão'}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Resumo do faturamento</Text>
        <View style={styles.kpiRow}>
          <Kpi label="Apresentado" valor={p.apresentado} ajuda="enviado às operadoras" />
          <Kpi label="Recebido" valor={p.recebido} ajuda="a operadora pagou" />
          <Kpi label="Glosado" valor={p.glosado} ajuda="não pago pela operadora" />
          <Kpi
            label="Taxa de reversão"
            /* Por valor, não por quantidade: com aceite parcial, "80% dos
               recursos aceitos" pode significar 20% do dinheiro de volta. */
            valor={p.taxaValor == null ? '—' : `${p.taxaValor}%`}
            ajuda={p.taxaValor == null ? 'sem recursos decididos' : 'do valor pleiteado'}
          />
        </View>

        <Text style={styles.sectionLabel}>Situação do valor glosado</Text>
        <View style={styles.kpiRow}>
          <Kpi label="Ainda recuperável" valor={p.recuperavel} ajuda="dentro do prazo" />
          <Kpi label="Em recurso" valor={p.emRecurso} ajuda="aguardando decisão" />
          <Kpi label="Perdido por prazo" valor={p.perdido} ajuda="sem recurso possível" />
          <Kpi label="Recuperado" valor={p.recuperado} ajuda="voltou para o caixa" />
        </View>

        {/* Quanto cada operadora glosou */}
        <Text style={styles.sectionLabel}>Glosas por operadora</Text>
        <View style={styles.tabela}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: '55%' }]}>Operadora</Text>
            <Text style={[styles.th, { width: '20%', textAlign: 'right' }]}>Demonstrativos</Text>
            <Text style={[styles.th, { width: '25%', textAlign: 'right' }]}>Glosado</Text>
          </View>
          {p.porOperadora.length === 0 ? (
            <Text style={styles.vazio}>Nenhum demonstrativo processado no período.</Text>
          ) : (
            p.porOperadora.map((o, i) => (
              <View key={i} style={[styles.tableRow, ...(i % 2 ? [styles.tableRowAlt] : [])]}>
                <Text style={[styles.td, { width: '55%' }]}>{o.operadora}</Text>
                <Text style={[styles.td, { width: '20%', textAlign: 'right' }]}>{o.lotes}</Text>
                <Text style={[styles.td, { width: '25%', textAlign: 'right', fontWeight: 700, color: COLORS.glosadoH }]}>
                  {o.glosado}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* A pergunta que decide onde gastar tempo: quando eu brigo, ela paga? */}
        {p.desempenho.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Resposta das operadoras aos recursos</Text>
            <View style={styles.tabela}>
              <View style={styles.tableHead}>
                <Text style={[styles.th, { width: '32%' }]}>Operadora</Text>
                <Text style={[styles.th, { width: '20%', textAlign: 'right' }]}>Recuperado</Text>
                <Text style={[styles.th, { width: '18%', textAlign: 'right' }]}>Do pleiteado</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Aceitos</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Resposta em</Text>
              </View>
              {p.desempenho.map((d, i) => (
                <View key={i} style={[styles.tableRow, ...(i % 2 ? [styles.tableRowAlt] : [])]}>
                  <Text style={[styles.td, { width: '32%' }]}>{d.operadora}</Text>
                  <Text style={[styles.td, { width: '20%', textAlign: 'right', fontWeight: 700, color: COLORS.recuperadoH }]}>
                    {d.recuperado}
                  </Text>
                  <Text style={[d.taxaValor == null ? styles.tdFraco : styles.td, { width: '18%', textAlign: 'right', fontWeight: 700 }]}>
                    {d.taxaValor == null ? '—' : `${d.taxaValor}%`}
                  </Text>
                  <Text style={[d.decididos ? styles.td : styles.tdFraco, { width: '15%', textAlign: 'right' }]}>
                    {d.decididos ? `${d.ganhos} de ${d.decididos}` : 'aguardando'}
                  </Text>
                  <Text style={[d.diasMedios == null ? styles.tdFraco : styles.td, { width: '15%', textAlign: 'right' }]}>
                    {d.diasMedios == null ? '—' : `${d.diasMedios} dias`}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Lista acionável: o que vale uma cobrança */}
        {p.fila.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Recursos aguardando resposta</Text>
            <View style={styles.tabela}>
              <View style={styles.tableHead}>
                <Text style={[styles.th, { width: '22%' }]}>Guia</Text>
                <Text style={[styles.th, { width: '30%' }]}>Operadora</Text>
                <Text style={[styles.th, { width: '18%' }]}>Enviado em</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Pleiteado</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Esperando</Text>
              </View>
              {p.fila.map((f, i) => (
                <View key={i} style={[styles.tableRow, ...(i % 2 ? [styles.tableRowAlt] : [])]}>
                  <Text style={[styles.td, { width: '22%' }]}>{f.guia}</Text>
                  <Text style={[styles.td, { width: '30%' }]}>{f.operadora}</Text>
                  <Text style={[styles.td, { width: '18%' }]}>{f.enviadoEm}</Text>
                  <Text style={[styles.td, { width: '15%', textAlign: 'right' }]}>{f.valor}</Text>
                  <Text
                    style={[
                      styles.td,
                      {
                        width: '15%',
                        textAlign: 'right',
                        fontWeight: 700,
                        /* 30 dias é quando deixa de ser espera normal e
                           passa a valer uma cobrança — mesmo limiar da tela. */
                        color: (f.diasEsperando ?? 0) >= 30 ? COLORS.glosadoH : COLORS.ink800,
                      },
                    ]}
                  >
                    {f.diasEsperando == null ? '—' : `${f.diasEsperando} d`}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Evolução só com mais de uma competência — igual à tela. */}
        {p.porCompetencia.length > 1 && (
          <>
            <Text style={styles.sectionLabel}>Evolução por competência</Text>
            <View style={styles.tabela}>
              <View style={styles.tableHead}>
                <Text style={[styles.th, { width: '28%' }]}>Competência</Text>
                <Text style={[styles.th, { width: '24%', textAlign: 'right' }]}>Apresentado</Text>
                <Text style={[styles.th, { width: '24%', textAlign: 'right' }]}>Recebido</Text>
                <Text style={[styles.th, { width: '24%', textAlign: 'right' }]}>Glosado</Text>
              </View>
              {p.porCompetencia.map((c, i) => (
                <View key={i} style={[styles.tableRow, ...(i % 2 ? [styles.tableRowAlt] : [])]}>
                  <Text style={[styles.td, { width: '28%' }]}>{c.competencia}</Text>
                  <Text style={[styles.td, { width: '24%', textAlign: 'right' }]}>{c.apresentado}</Text>
                  <Text style={[styles.td, { width: '24%', textAlign: 'right' }]}>{c.pago}</Text>
                  <Text style={[styles.td, { width: '24%', textAlign: 'right', color: COLORS.glosadoH }]}>{c.glosado}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerText}>Gerado automaticamente por Recupera Glosa</Text>
            <Text style={styles.footerUrl}>recuperaglosa.com.br</Text>
          </View>
          <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
