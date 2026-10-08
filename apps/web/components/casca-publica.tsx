"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Marca } from "./logo";

function navAtivo(href: string, pathname: string) {
  const ativo = pathname === href || pathname.startsWith(`${href}/`);
  return ativo
    ? "rounded-md bg-brand-mint px-3 py-1.5 text-sm font-medium text-brand-ink"
    : "rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50";
}

export function CascaPublica({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const nav = (
    <>
      <Link href="/catalogo" className={navAtivo("/catalogo", pathname)}>
        Catálogo
      </Link>
      <Link href="/personalizada" className={navAtivo("/personalizada", pathname)}>
        Trilha personalizada
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Marca />
            <span className="truncate text-sm font-semibold text-brand-ink">EstudaAI</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">{nav}</nav>
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <Link
              href="/login?next=/catalogo"
              className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Entrar
            </Link>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">{nav}</nav>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-8">{children}</section>
    </div>
  );
}
