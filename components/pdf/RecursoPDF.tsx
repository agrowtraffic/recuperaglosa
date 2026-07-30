import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

/* ============================================================
   Paleta — igual a styles/tokens.css (pinho + lima da marca).
   react-pdf não lê CSS var, os hex ficam fixos aqui; se a marca
   mudar, atualizar os dois arquivos juntos. */
const COLORS = {
  brand: '#073b32',
  brandDeep: '#052b25',
  paper: '#fffef9',
  ink900: '#10231f',
  ink800: '#17302b',
  ink600: '#3d5751',
  ink400: '#61706c',
  ink300: '#9aa9a4',
  line: '#dce5df',
  lineSoft: '#eaf0ec',
  canvas: '#f4f6ef',
  muted: '#edf2e9',
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

  /* Local/data e endereçamento */
  dataLinha: { fontSize: 8.5, color: COLORS.ink600, textAlign: 'right', marginBottom: 14 },
  enderecamento: { fontSize: 9, color: COLORS.ink800, marginBottom: 4, lineHeight: 1.5 },
  assunto: { fontSize: 9, color: COLORS.ink800, marginBottom: 14, lineHeight: 1.5 },
  assuntoLabel: { fontWeight: 700 },

  /* Seções de identificação */
  sectionLabel: { fontSize: 7, fontWeight: 700, color: COLORS.brand, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  identRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, backgroundColor: COLORS.canvas, borderRadius: 4, padding: 10 },
  kv: { marginRight: 28, marginBottom: 4, minWidth: 90 },
  kvLabel: { fontSize: 7, color: COLORS.ink400 },
  kvValue: { fontSize: 9, fontWeight: 700, color: COLORS.ink800, marginTop: 1 },

  /* Corpo da petição */
  corpoTexto: { fontSize: 9, color: COLORS.ink800, marginBottom: 12, lineHeight: 1.5, textAlign: 'justify' },

  /* Grupo por motivo */
  grupo: { marginBottom: 12 },
  grupoHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: COLORS.glosadoBg, borderLeftWidth: 3, borderLeftColor: COLORS.glosado, borderRadius: 3, padding: 9, marginBottom: 6 },
  grupoCodigo: { fontSize: 7, fontWeight: 700, color: COLORS.glosadoH, marginBottom: 2 },
  grupoMotivo: { fontSize: 9, fontWeight: 700, color: COLORS.ink900, maxWidth: 340 },
  grupoSubtotal: { fontSize: 11, fontWeight: 700, color: COLORS.glosadoH },
  grupoArgumentoLabel: { fontSize: 7, fontWeight: 700, color: COLORS.brand, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.4 },
  grupoArgumento: { fontSize: 8.5, color: COLORS.ink600, lineHeight: 1.45, marginBottom: 8, textAlign: 'justify' },

  /* Tabela de itens (dentro de cada grupo) */
  tableHead: { flexDirection: 'row', backgroundColor: COLORS.ink800, padding: 6, borderRadius: 2 },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 0.6, borderBottomColor: COLORS.lineSoft },
  tableRowAlt: { backgroundColor: COLORS.canvas },
  th: { fontSize: 7, fontWeight: 700, color: COLORS.paper, textTransform: 'uppercase' },
  td: { fontSize: 8.3, color: COLORS.ink800 },
  colProc: { width: '48%' },
  colVal: { width: '17.33%', textAlign: 'right' },

  /* Total geral */
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.brand, marginTop: 6, padding: 13, borderRadius: 4 },
  totalLabel: { fontSize: 7.5, color: '#c9d6d1', textTransform: 'uppercase', letterSpacing: 0.5 },
  totalValor: { fontSize: 18, fontWeight: 700, color: COLORS.paper, marginTop: 2 },
  totalTexto: { fontSize: 7.8, color: '#e3ece8', textAlign: 'right', maxWidth: 230, lineHeight: 1.4 },

  /* Fecho */
  fecho: { fontSize: 9, color: COLORS.ink800, marginTop: 16, marginBottom: 30, lineHeight: 1.5, textAlign: 'justify' },

  /* Assinatura */
  assinaturaWrap: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  assinatura: { width: 250, borderTopWidth: 0.8, borderTopColor: COLORS.ink300, paddingTop: 5 },
  assinaturaNome: { fontSize: 9.5, fontWeight: 700, color: COLORS.ink800 },
  assinaturaLinha: { fontSize: 8, color: COLORS.ink400, marginTop: 1 },
  protocoloBox: { alignItems: 'flex-end' },
  protocoloLabel: { fontSize: 6.5, color: COLORS.ink300, textTransform: 'uppercase' },
  protocoloValor: { fontSize: 8, color: COLORS.ink600, marginTop: 1, fontFamily: 'Courier' },

  /* Rodapé fixo */
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 42, backgroundColor: COLORS.brand, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 34, justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, fontWeight: 700, color: COLORS.paper },
  footerUrl: { fontSize: 6.5, color: '#a7bdb5', marginTop: 1 },
  footerPage: { fontSize: 7, color: '#a7bdb5' },
});

export type ItemPDF = {
  procedimento: string;
  apresentado: string;
  pago: string;
  glosado: string;
};

export type GrupoMotivoPDF = {
  codigoGlosa: string;
  motivoDescricao: string;
  argumento: string;
  itens: ItemPDF[];
  subtotal: string;
};

export type RecursoPDFProps = {
  clinicaNome: string;
  clinicaCnpj: string;
  clinicaLogoUrl?: string | null;

  responsavelNome?: string | null;
  responsavelConselho?: string | null;
  responsavelRegistro?: string | null;
  responsavelUf?: string | null;
  responsavelCnes?: string | null;

  operadora: string;
  registroAns?: string;
  competencia?: string;
  numeroDemonstrativo?: string;

  numeroGuia: string;
  beneficiario?: string;
  carteira?: string;
  dataAtendimento?: string;

  grupos: GrupoMotivoPDF[];
  valorTotal: string;

  dataEmissao: string;
  protocolo?: string;
};

function KV({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );
}

export function RecursoPDF(p: RecursoPDFProps) {
  const temResponsavel = Boolean(p.responsavelNome);
  const registroCompleto = [p.responsavelConselho, p.responsavelRegistro && `${p.responsavelRegistro}${p.responsavelUf ? '/' + p.responsavelUf : ''}`]
    .filter(Boolean)
    .join(' ');

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
            <Text style={styles.docTitulo}>RECURSO DE GLOSA</Text>
            <Text style={styles.docSub}>Contestação administrativa — padrão TISS/ANS</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <Text style={styles.dataLinha}>{p.dataEmissao}</Text>

        {/* Endereçamento formal */}
        <Text style={styles.enderecamento}>
          Ao Setor de Contas Médicas / Auditoria de Glosas
        </Text>
        <Text style={styles.enderecamento}>
          {p.operadora}{p.registroAns ? ` — Registro ANS ${p.registroAns}` : ''}
        </Text>
        <Text style={styles.assunto}>
          <Text style={styles.assuntoLabel}>Assunto: </Text>
          Recurso administrativo de glosa — Guia nº {p.numeroGuia}
          {p.numeroDemonstrativo ? `, Demonstrativo ${p.numeroDemonstrativo}` : ''}
          {p.competencia ? `, Competência ${p.competencia}` : ''}.
        </Text>

        {/* Identificação */}
        <Text style={styles.sectionLabel}>Guia contestada</Text>
        <View style={styles.identRow}>
          <KV label="Nº da guia" value={p.numeroGuia} />
          <KV label="Beneficiário" value={p.beneficiario} />
          <KV label="Carteira" value={p.carteira} />
          <KV label="Atendimento" value={p.dataAtendimento} />
        </View>

        {/* Corpo */}
        <Text style={styles.corpoTexto}>
          {p.clinicaNome}, prestador de serviços de saúde devidamente identificado, vem
          respeitosamente apresentar recurso administrativo contra a(s) glosa(s) aplicada(s)
          na guia acima referenciada, processada no demonstrativo de análise de contas desta
          operadora, pelos fundamentos a seguir expostos, item a item.
        </Text>

        <Text style={styles.sectionLabel}>Itens contestados e fundamentação</Text>

        {p.grupos.map((grupo, gi) => (
          <View key={gi} style={styles.grupo}>
            <View style={styles.grupoHead}>
              <View style={{ maxWidth: 360 }}>
                <Text style={styles.grupoCodigo}>MOTIVO INFORMADO PELA OPERADORA — CÓD. {grupo.codigoGlosa}</Text>
                <Text style={styles.grupoMotivo}>{grupo.motivoDescricao}</Text>
              </View>
              <Text style={styles.grupoSubtotal}>{grupo.subtotal}</Text>
            </View>

            <Text style={styles.grupoArgumentoLabel}>Contestação do prestador</Text>
            <Text style={styles.grupoArgumento}>{grupo.argumento}</Text>

            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colProc]}>Procedimento</Text>
              <Text style={[styles.th, styles.colVal]}>Apresentado</Text>
              <Text style={[styles.th, styles.colVal]}>Pago</Text>
              <Text style={[styles.th, styles.colVal]}>Glosado</Text>
            </View>
            {grupo.itens.map((item, ii) => (
              <View style={[styles.tableRow, ii % 2 === 1 ? styles.tableRowAlt : {}]} key={ii}>
                <Text style={[styles.td, styles.colProc]}>{item.procedimento}</Text>
                <Text style={[styles.td, styles.colVal]}>{item.apresentado}</Text>
                <Text style={[styles.td, styles.colVal]}>{item.pago}</Text>
                <Text style={[styles.td, styles.colVal, { color: COLORS.glosadoH, fontWeight: 700 }]}>{item.glosado}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalBox}>
          <View>
            <Text style={styles.totalLabel}>Valor total pleiteado</Text>
            <Text style={styles.totalValor}>{p.valorTotal}</Text>
          </View>
          <Text style={styles.totalTexto}>
            Requer-se a reanálise e o reprocessamento dos valores glosados acima
            fundamentados, com o respectivo pagamento na próxima competência.
          </Text>
        </View>

        {/* Fecho */}
        <Text style={styles.fecho}>
          Nestes termos, pede deferimento.
        </Text>

        {/* Assinatura */}
        <View style={styles.assinaturaWrap}>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaNome}>
              {temResponsavel ? p.responsavelNome : p.clinicaNome}
            </Text>
            <Text style={styles.assinaturaLinha}>
              {temResponsavel && registroCompleto ? registroCompleto : 'Responsável técnico'}
            </Text>
            {p.responsavelCnes ? <Text style={styles.assinaturaLinha}>CNES {p.responsavelCnes}</Text> : null}
          </View>
          {p.protocolo ? (
            <View style={styles.protocoloBox}>
              <Text style={styles.protocoloLabel}>Protocolo interno</Text>
              <Text style={styles.protocoloValor}>{p.protocolo}</Text>
            </View>
          ) : null}
        </View>

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
