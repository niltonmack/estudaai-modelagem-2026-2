export function LogoHorizontal({ inverso = false }: { inverso?: boolean }) {
  const src = inverso ? "/identidade/logo-horizontal-inverso.svg" : "/identidade/logo-horizontal.svg";
  return <img src={src} alt="EstudaAI" className="h-9 w-auto" />;
}

export function Marca() {
  return <img src="/identidade/marca.svg" alt="" className="h-8 w-8" />;
}
