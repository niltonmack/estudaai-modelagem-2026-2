export function texComVirgulaDecimal(tex: string) {
  return tex.replace(/(\d),(\d)/g, "$1{,}$2");
}

export function formulaExibida(linha: string): string | null {
  const texto = linha.trim();
  if (!texto.startsWith("$$") || !texto.endsWith("$$") || texto.length < 5) return null;
  const miolo = texto.slice(2, -2);
  if (miolo.includes("$$")) return null;
  return miolo.trim();
}
