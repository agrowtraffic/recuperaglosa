/* ============================================================
   MARCA — usa o arquivo oficial do kit da marca.

   Antes isto era um wordmark desenhado em CSS (três barrinhas +
   "recuperaglosa" em minúsculas), que não corresponde à marca real.

   O logo é bicolor (verde + azul-marinho). Sobre fundo escuro o
   "Glosa" desapareceria, então a variante clara é o mesmo arquivo
   renderizado em branco sólido — uso monocromático legítimo, e sem
   precisar de um segundo arquivo.

   <Brand />                  → sobre fundo claro
   <Brand tom="claro" />      → sobre fundo escuro (branco)
   <Brand compacto />         → só o símbolo
   ============================================================ */
import Image from "next/image";

export function Brand({ tom = "escuro", compacto = false, className = "", altura = 34 }) {
  const claro = tom === "claro";

  if (compacto) {
    return (
      <Image
        src="/marca/icone-512.png"
        alt="RecuperaGlosa"
        width={altura}
        height={altura}
        className={className}
        priority
        style={claro ? { filter: "brightness(0) invert(1)" } : undefined}
      />
    );
  }

  /* 1689x501 no arquivo original → proporção 3.37:1 */
  const largura = Math.round(altura * 3.37);

  return (
    <Image
      src="/marca/horizontal.png"
      alt="RecuperaGlosa"
      width={largura}
      height={altura}
      className={className}
      priority
      style={{
        height: altura,
        width: "auto",
        ...(claro ? { filter: "brightness(0) invert(1)" } : null),
      }}
    />
  );
}

export default Brand;
