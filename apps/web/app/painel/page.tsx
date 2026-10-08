"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { lerSessao, Sessao } from "@/lib/sessao";

export default function PainelPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);

  useEffect(() => {
    const atual = lerSessao();
    if (!atual) {
      router.replace("/login");
      return;
    }
    if (atual.perfil !== "administrador") {
      router.replace("/inicio");
      return;
    }
    setSessao(atual);
  }, [router]);

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      <h2 className="text-2xl font-semibold">Painel administrativo</h2>
      <p className="mt-2 max-w-xl text-slate-600">
        {sessao.nome.split(" ")[0]}, você está na área administrativa. O aluno continua responsável por estudar.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/categorias"
          className="rounded-lg border border-slate-200 bg-white p-4 text-sm hover:border-brand-trail"
        >
          <p className="font-medium text-brand-ink">Categorias</p>
          <p className="mt-1 text-slate-600">Organizar o catálogo por área de estudo.</p>
        </Link>
        <Link
          href="/trilhas"
          className="rounded-lg border border-slate-200 bg-white p-4 text-sm hover:border-brand-trail"
        >
          <p className="font-medium text-brand-ink">Trilhas e etapas</p>
          <p className="mt-1 text-slate-600">Publicar percursos com etapas em ordem.</p>
        </Link>
        <Link
          href="/usuarios"
          className="rounded-lg border border-slate-200 bg-white p-4 text-sm hover:border-brand-trail"
        >
          <p className="font-medium text-brand-ink">Usuários</p>
          <p className="mt-1 text-slate-600">Cadastrar, alterar e remover alunos e administradores.</p>
        </Link>
        <Link
          href="/acompanhamentos"
          className="rounded-lg border border-slate-200 bg-white p-4 text-sm hover:border-brand-trail"
        >
          <p className="font-medium text-brand-ink">Andamento dos alunos</p>
          <p className="mt-1 text-slate-600">Ver quais trilhas cada aluno faz e o percentual.</p>
        </Link>
        <Link
          href="/agente"
          className="rounded-lg border border-slate-200 bg-white p-4 text-sm hover:border-brand-trail"
        >
          <p className="font-medium text-brand-ink">Agente LLM</p>
          <p className="mt-1 text-slate-600">Ligar ou desligar a geração de trilhas personalizadas.</p>
        </Link>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        O botão <strong>Sair</strong> no topo encerra a sessão.
      </p>
    </AppShell>
  );
}
