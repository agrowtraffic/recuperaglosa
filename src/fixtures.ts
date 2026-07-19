/**
 * Gera 3 demonstrativos sintéticos com glosas plantadas.
 * Cada um usa uma VARIAÇÃO de layout de propósito — é assim que se testa
 * a tolerância do parser antes de ter arquivo real de operadora.
 */
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("fixtures", { recursive: true });

// ---- Fixture 1: layout "canônico" com prefixo ans: ----
const f1 = `<?xml version="1.0" encoding="UTF-8"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
  <ans:demonstrativoAnaliseConta>
    <ans:nomeOperadora>OPERADORA ALFA SAUDE</ans:nomeOperadora>
    <ans:registroANS>301234</ans:registroANS>
    <ans:numeroDemonstrativo>DEM-2026-0451</ans:numeroDemonstrativo>
    <ans:competencia>2026-06</ans:competencia>

    <ans:guiaDemonstrativo>
      <ans:numeroGuiaPrestador>G-10231</ans:numeroGuiaPrestador>
      <ans:numeroGuiaOperadora>OP-99871</ans:numeroGuiaOperadora>
      <ans:nomeBeneficiario>PACIENTE TESTE UM</ans:nomeBeneficiario>
      <ans:numeroCarteira>0001234567</ans:numeroCarteira>
      <ans:dataAtendimento>2026-06-04</ans:dataAtendimento>
      <ans:procedimento>
        <ans:codigoProcedimento>10101012</ans:codigoProcedimento>
        <ans:descricaoProcedimento>Consulta em consultorio</ans:descricaoProcedimento>
        <ans:quantidadeExecutada>1</ans:quantidadeExecutada>
        <ans:valorApresentado>120.00</ans:valorApresentado>
        <ans:valorPago>120.00</ans:valorPago>
      </ans:procedimento>
      <ans:procedimento>
        <ans:codigoProcedimento>40304361</ans:codigoProcedimento>
        <ans:descricaoProcedimento>Raspagem subgengival</ans:descricaoProcedimento>
        <ans:quantidadeExecutada>2</ans:quantidadeExecutada>
        <ans:valorApresentado>380.00</ans:valorApresentado>
        <ans:valorPago>0.00</ans:valorPago>
        <ans:valorGlosa>380.00</ans:valorGlosa>
        <ans:codigoGlosa>1007</ans:codigoGlosa>
      </ans:procedimento>
    </ans:guiaDemonstrativo>

    <ans:guiaDemonstrativo>
      <ans:numeroGuiaPrestador>G-10232</ans:numeroGuiaPrestador>
      <ans:nomeBeneficiario>PACIENTE TESTE DOIS</ans:nomeBeneficiario>
      <ans:dataAtendimento>2026-06-11</ans:dataAtendimento>
      <ans:procedimento>
        <ans:codigoProcedimento>40201014</ans:codigoProcedimento>
        <ans:descricaoProcedimento>Restauracao em resina</ans:descricaoProcedimento>
        <ans:quantidadeExecutada>3</ans:quantidadeExecutada>
        <ans:valorApresentado>450.00</ans:valorApresentado>
        <ans:valorPago>300.00</ans:valorPago>
        <ans:valorGlosa>150.00</ans:valorGlosa>
        <ans:codigoGlosa>1010</ans:codigoGlosa>
      </ans:procedimento>
      <ans:procedimento>
        <ans:codigoProcedimento>40101010</ans:codigoProcedimento>
        <ans:descricaoProcedimento>Radiografia periapical</ans:descricaoProcedimento>
        <ans:quantidadeExecutada>1</ans:quantidadeExecutada>
        <ans:valorApresentado>60.00</ans:valorApresentado>
        <ans:valorPago>0.00</ans:valorPago>
        <ans:codigoGlosa>1701</ans:codigoGlosa>
      </ans:procedimento>
    </ans:guiaDemonstrativo>
  </ans:demonstrativoAnaliseConta>
</ans:mensagemTISS>`;

// ---- Fixture 2: SEM prefixo de namespace + nomes alternativos ----
const f2 = `<?xml version="1.0" encoding="UTF-8"?>
<mensagemTISS>
  <demonstrativoAnaliseConta>
    <razaoSocial>BETA ODONTO LTDA</razaoSocial>
    <registroANS>412345</registroANS>
    <mesCompetencia>2026-06</mesCompetencia>
    <dadosGuia>
      <numeroGuia>B-77001</numeroGuia>
      <beneficiario>PACIENTE TESTE TRES</beneficiario>
      <dataExecucao>2026-06-18</dataExecucao>
      <itemGuia>
        <codigoTUSS>81000103</codigoTUSS>
        <descricao>Exodontia simples</descricao>
        <quantidade>1</quantidade>
        <valorInformado>200,00</valorInformado>
        <valorLiberado>0,00</valorLiberado>
        <motivoGlosa>1301</motivoGlosa>
      </itemGuia>
      <itemGuia>
        <codigoTUSS>81000260</codigoTUSS>
        <descricao>Profilaxia</descricao>
        <quantidade>1</quantidade>
        <valorInformado>90,00</valorInformado>
        <valorLiberado>72,00</valorLiberado>
        <motivoGlosa>1401</motivoGlosa>
      </itemGuia>
    </dadosGuia>
  </demonstrativoAnaliseConta>
</mensagemTISS>`;

// ---- Fixture 3: glosa SEM código (o caso que mais irrita a clínica) ----
const f3 = `<?xml version="1.0" encoding="UTF-8"?>
<tiss:mensagemTISS xmlns:tiss="http://www.ans.gov.br/padroes/tiss/schemas">
  <tiss:demonstrativoAnaliseConta>
    <tiss:nomeOperadora>GAMA SAUDE</tiss:nomeOperadora>
    <tiss:competencia>2026-06</tiss:competencia>
    <tiss:guia>
      <tiss:numeroGuiaPrestador>C-5501</tiss:numeroGuiaPrestador>
      <tiss:nomeBeneficiario>PACIENTE TESTE QUATRO</tiss:nomeBeneficiario>
      <tiss:dataAtendimento>2026-06-22</tiss:dataAtendimento>
      <tiss:procedimentoExecutado>
        <tiss:codigoProcedimento>10101039</tiss:codigoProcedimento>
        <tiss:descricaoProcedimento>Consulta de urgencia</tiss:descricaoProcedimento>
        <tiss:valorApresentado>150.00</tiss:valorApresentado>
        <tiss:valorPago>0.00</tiss:valorPago>
      </tiss:procedimentoExecutado>
      <tiss:procedimentoExecutado>
        <tiss:codigoProcedimento>20101025</tiss:codigoProcedimento>
        <tiss:descricaoProcedimento>Curativo</tiss:descricaoProcedimento>
        <tiss:valorApresentado>80.00</tiss:valorApresentado>
        <tiss:valorPago>80.00</tiss:valorPago>
      </tiss:procedimentoExecutado>
    </tiss:guia>
  </tiss:demonstrativoAnaliseConta>
</tiss:mensagemTISS>`;

writeFileSync("fixtures/demonstrativo-1.xml", f1);
writeFileSync("fixtures/demonstrativo-2.xml", f2);
writeFileSync("fixtures/demonstrativo-3.xml", f3);
console.log("3 fixtures gerados em ./fixtures");
