"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { limparSessao } from "@/lib/sessao";
import { chamarApi } from "@/lib/api";
import { Marca } from "./logo";

function navAtivo(href: string, pathname: string) {
  const ativo = pathname === href || pathname.startsWith(`${href}/`);
  return ativo
    ? "rounded-md bg-brand-mint px-3 py-1.5 text-sm font-medium text-brand-ink"
    : "rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50";
}

export function AppShell({
  nome,
  papel,
  token,
  children
}: {
  nome: string;
  papel: "Aluno" | "Administrador";
  token: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = papel === "Administrador";
  const navAluno = (
    <>
      <Link href="/inicio" className={navAtivo("/inicio", pathname)}>
        Início
      </Link>
      <Link href="/catalogo" className={navAtivo("/catalogo", pathname)}>
        Catálogo
      </Link>
      <Link href="/personalizada" className={navAtivo("/personalizada", pathname)}>
        Trilha personalizada
      </Link>
      <Link href="/progresso" className={navAtivo("/progresso", pathname)}>
        Meu progresso
      </Link>
    </>
  );
  const navAdmin = (
    <>
      <Link href="/painel" className={navAtivo("/painel", pathname)}>
        Painel
      </Link>
      <Link href="/categorias" className={navAtivo("/categorias", pathname)}>
        Categorias
      </Link>
      <Link href="/trilhas" className={navAtivo("/trilhas", pathname)}>
        Trilhas
      </Link>
      <Link href="/usuarios" className={navAtivo("/usuarios", pathname)}>
        Usuários
      </Link>
      <Link href="/acompanhamentos" className={navAtivo("/acompanhamentos", pathname)}>
        Andamento
      </Link>
      <Link href="/agente" className={navAtivo("/agente", pathname)}>
        Agente LLM
      </Link>
    </>
  );

  async function sair() {
    await chamarApi("/auth/logout", { method: "POST", token });
    limparSessao();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Marca />
            <span className="truncate text-sm font-semibold text-brand-ink">EstudaAI</span>
            <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 md:inline">{papel}</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">{isAdmin ? navAdmin : navAluno}</nav>
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <span className="max-w-[6.5rem] truncate text-sm text-slate-600 sm:max-w-[9rem]">{nome}</span>
            <button
              type="button"
              onClick={() => void sair()}
              className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
          {isAdmin ? navAdmin : navAluno}
        </nav>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-8">{children}</section>
    </div>
  );
}
