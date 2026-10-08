"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { lerSessao, Sessao } from "@/lib/sessao";

export default function InicioPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);

  useEffect(() => {
    const atual = lerSessao();
    if (!atual) {
      router.replace("/login");
      return;
    }
    if (atual.perfil !== "aluno") {
      router.replace("/painel");
      return;
    }
    setSessao(atual);
  }, [router]);

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
      <h2 className="text-2xl font-semibold">Olá, {sessao.nome.split(" ")[0]}</h2>
      <p className="mt-2 max-w-xl text-slate-600">
        Você está autenticado como <strong>aluno</strong>. Escolha uma trilha no catálogo ou descreva um objetivo para o
        agente.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/catalogo"
          className="rounded-lg border border-slate-200 bg-white p-4 text-sm hover:border-brand-trail"
        >
          <p className="font-semibold text-brand-ink">Catálogo</p>
          <p className="mt-1 text-slate-500">Trilhas pré-definidas por categoria.</p>
        </Link>
        <Link
          href="/progresso"
          className="rounded-lg border border-slate-200 bg-white p-4 text-sm hover:border-brand-trail"
        >
          <p className="font-semibold text-brand-ink">Meu progresso</p>
          <p className="mt-1 text-slate-500">Veja quanto já concluiu e o histórico das etapas.</p>
        </Link>
        <Link
          href="/personalizada"
          className="rounded-lg border border-slate-200 bg-white p-4 text-sm hover:border-brand-trail"
        >
          <p className="font-semibold text-brand-ink">Trilha personalizada</p>
          <p className="mt-1 text-slate-500">Descreva um objetivo; o agente monta um percurso para você.</p>
        </Link>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        O botão <strong>Sair</strong> no topo encerra a sessão.
      </p>
    </AppShell>
  );
}
