import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

const COLORS = {
  green: '#16A34A',
  navy: '#0F172A',
  gray: '#64748B',
  orange: '#F97316',
  light: '#F1F5F9',
  softOrange: '#FDF2E9',
};

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 9, fontFamily: 'Helvetica', color: COLORS.navy },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10 },
  clinicaRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  clinicaNome: { fontSize: 15, fontWeight: 700, color: COLORS.navy },
  clinicaCnpj: { fontSize: 8, color: COLORS.gray, marginTop: 2 },
  docTitulo: { fontSize: 9, fontWeight: 700, color: COLORS.green, textAlign: 'right' },
  docSub: { fontSize: 7.5, color: COLORS.gray, textAlign: 'right', marginTop: 2 },
  divider: { height: 1.4, backgroundColor: COLORS.green, marginHorizontal: 18, marginBottom: 14 },
  sectionLabel: { fontSize: 7.5, fontWeight: 700, color: COLORS.green, marginHorizontal: 18, marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginHorizontal: 18, marginBottom: 12 },
  kv: { marginRight: 40 },
  kvLabel: { fontSize: 7.5, color: COLORS.gray },
  kvValue: { fontSize: 9.5, fontWeight: 700, color: COLORS.navy, marginTop: 2 },
  hr: { height: 0.6, backgroundColor: '#E5E7EB', marginHorizontal: 18, marginBottom: 14 },
  tableHead: { flexDirection: 'row', backgroundColor: COLORS.light, marginHorizontal: 18, padding: 6, borderRadius: 2 },
  tableRow: { flexDirection: 'row', marginHorizontal: 18, padding: 6, borderBottomWidth: 0.6, borderBottomColor: '#EEF0F3' },
  th: { fontSize: 7.5, fontWeight: 700 },
  td: { fontSize: 8.5 },
  colProc: { width: '46%' },
  colVal: { width: '18%' },
  motivoBox: { backgroundColor: COLORS.softOrange, marginHorizontal: 18, marginTop: 10, padding: 10, borderRadius: 3 },
  motivoLabel: { fontSize: 7.5, fontWeight: 700, color: COLORS.orange, marginBottom: 4 },
  motivoTitulo: { fontSize: 9, fontWeight: 700, color: COLORS.navy, marginBottom: 4 },
  motivoTexto: { fontSize: 8, color: COLORS.gray, lineHeight: 1.4 },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.navy, marginHorizontal: 18, marginTop: 10, padding: 12, borderRadius: 3 },
  totalLabel: { fontSize: 7.5, color: '#94A3B8' },
  totalValor: { fontSize: 16, fontWeight: 700, color: COLORS.green, marginTop: 2 },
  totalTexto: { fontSize: 7.5, color: '#FFFFFF', textAlign: 'right', maxWidth: 220, lineHeight: 1.4 },
  assinatura: { marginHorizontal: 18, marginTop: 30, width: 200, borderTopWidth: 0.6, borderTopColor: '#CBD5E1', paddingTop: 4 },
  assinaturaTexto: { fontSize: 7.5, color: COLORS.gray },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: COLORS.navy, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, fontWeight: 700, color: '#FFFFFF' },
  footerUrl: { fontSize: 6.5, color: '#94A3B8', marginTop: 1 },
  footerPage: { fontSize: 7, color: '#94A3B8' },
});

export type RecursoPDFProps = {
  clinicaNome: string;
  clinicaCnpj: string;
  clinicaLogoUrl?: string | null;
  operadora: string;
  registroAns?: string;
  competencia?: string;
  numeroDemonstrativo?: string;
  numeroGuia: string;
  beneficiario?: string;
  carteira?: string;
  dataAtendimento?: string;
  itens: { descricao: string; apresentado: string; pago: string; glosado: string }[];
  motivoCodigo: string;
  motivoDescricao: string;
  motivoArgumento: string;
  valorTotal: string;
};

export function RecursoPDF(p: RecursoPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.clinicaRow}>
            {p.clinicaLogoUrl ? <Image src={p.clinicaLogoUrl} style={styles.logo} /> : null}
            <View>
              <Text style={styles.clinicaNome}>{p.clinicaNome}</Text>
              <Text style={styles.clinicaCnpj}>CNPJ {p.clinicaCnpj}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.docTitulo}>RECURSO DE GLOSA</Text>
            <Text style={styles.docSub}>Contestação administrativa — padrão TISS/ANS</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Dados da operadora</Text>
        <View style={styles.row}>
          <View style={styles.kv}><Text style={styles.kvLabel}>Operadora</Text><Text style={styles.kvValue}>{p.operadora}</Text></View>
          {p.registroAns ? <View style={styles.kv}><Text style={styles.kvLabel}>Registro ANS</Text><Text style={styles.kvValue}>{p.registroAns}</Text></View> : null}
          {p.competencia ? <View style={styles.kv}><Text style={styles.kvLabel}>Competência</Text><Text style={styles.kvValue}>{p.competencia}</Text></View> : null}
          {p.numeroDemonstrativo ? <View style={styles.kv}><Text style={styles.kvLabel}>Demonstrativo</Text><Text style={styles.kvValue}>{p.numeroDemonstrativo}</Text></View> : null}
        </View>

        <Text style={styles.sectionLabel}>Guia contestada</Text>
        <View style={styles.row}>
          <View style={styles.kv}><Text style={styles.kvLabel}>Nº da guia</Text><Text style={styles.kvValue}>{p.numeroGuia}</Text></View>
          {p.beneficiario ? <View style={styles.kv}><Text style={styles.kvLabel}>Beneficiário</Text><Text style={styles.kvValue}>{p.beneficiario}</Text></View> : null}
          {p.carteira ? <View style={styles.kv}><Text style={styles.kvLabel}>Carteira</Text><Text style={styles.kvValue}>{p.carteira}</Text></View> : null}
          {p.dataAtendimento ? <View style={styles.kv}><Text style={styles.kvLabel}>Atendimento</Text><Text style={styles.kvValue}>{p.dataAtendimento}</Text></View> : null}
        </View>
        <View style={styles.hr} />

        <Text style={styles.sectionLabel}>Itens contestados</Text>
        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.colProc]}>Procedimento</Text>
          <Text style={[styles.th, styles.colVal]}>Apresentado</Text>
          <Text style={[styles.th, styles.colVal]}>Pago</Text>
          <Text style={[styles.th, styles.colVal]}>Glosado</Text>
        </View>
        {p.itens.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.td, styles.colProc]}>{item.descricao}</Text>
            <Text style={[styles.td, styles.colVal]}>{item.apresentado}</Text>
            <Text style={[styles.td, styles.colVal]}>{item.pago}</Text>
            <Text style={[styles.td, styles.colVal, { color: COLORS.orange, fontWeight: 700 }]}>{item.glosado}</Text>
          </View>
        ))}

        <View style={styles.motivoBox}>
          <Text style={styles.motivoLabel}>MOTIVO INFORMADO PELA OPERADORA</Text>
          <Text style={styles.motivoTitulo}>{p.motivoCodigo} — {p.motivoDescricao}</Text>
          <Text style={styles.motivoTexto}>{p.motivoArgumento}</Text>
        </View>

        <View style={styles.totalBox}>
          <View>
            <Text style={styles.totalLabel}>VALOR TOTAL PLEITEADO</Text>
            <Text style={styles.totalValor}>{p.valorTotal}</Text>
          </View>
          <Text style={styles.totalTexto}>
            Requer-se a reanálise e o reprocessamento dos valores glosados, com pagamento na próxima competência.
          </Text>
        </View>

        <View style={styles.assinatura}>
          <Text style={styles.assinaturaTexto}>{p.clinicaNome}</Text>
          <Text style={styles.assinaturaTexto}>Responsável técnico</Text>
        </View>

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
