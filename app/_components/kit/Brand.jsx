/* ============================================================
   MARCA — wordmark construído em CSS, sem depender de arquivo externo.
   O símbolo combina barras de recuperação com um arco de retorno.

   <Brand />
   <Brand tom="claro" />
   <Brand compacto />
   ============================================================ */

export function Brand({ tom = "escuro", compacto = false, className = "" }) {
  return (
    <span
      className={`rg-brand rg-brand-${tom} ${compacto ? "rg-brand-compacto" : ""} ${className}`.trim()}
      aria-label="Recupera Glosa"
    >
      <span className="rg-brand-mark" aria-hidden="true">
        <i /><i /><i />
      </span>
      {!compacto && (
        <span className="rg-brand-name">
          recupera<span>glosa</span>
        </span>
      )}
    </span>
  );
}

export default Brand;
