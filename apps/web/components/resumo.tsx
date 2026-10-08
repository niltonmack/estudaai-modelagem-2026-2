import Link from "next/link";

export function Destaque({
  nome,
  titulo,
  texto,
  href,
  acao
}: {
  nome: string;
  titulo: string;
  texto: React.ReactNode;
  href: string;
  acao: string;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-ink p-6 text-white sm:flex-row sm:items-center">
      <div>
        <p className="text-sm text-brand-mint">Olá, {nome}</p>
        <h2 className="mt-1 text-xl font-semibold leading-snug sm:text-2xl">{titulo}</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-200">{texto}</p>
      </div>
      <Link
        href={href}
        className="inline-flex shrink-0 rounded-md bg-brand-trail px-4 py-2 text-sm font-medium text-white hover:bg-brand-trailDark"
      >
        {acao}
      </Link>
    </div>
  );
}

export function Numero({
  rotulo,
  valor,
  detalhe,
  destaque
}: {
  rotulo: string;
  valor: number | string;
  detalhe: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{rotulo}</p>
      <p className={`mt-1 text-2xl font-bold ${destaque ? "text-brand-trail" : "text-brand-ink"}`}>{valor}</p>
      <p className="text-xs text-slate-500">{detalhe}</p>
    </div>
  );
}

export function EsqueletoResumo({ texto }: { texto: string }) {
  return (
    <div aria-busy="true">
      <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200 lg:col-span-2" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{texto}</p>
    </div>
  );
}
