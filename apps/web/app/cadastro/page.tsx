"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell, Alerta, Botao, Campo } from "@/components/auth-ui";
import { LogoHorizontal } from "@/components/logo";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";

export default function CadastroPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    const { ok, dados } = await chamarApi<ErroApi>("/auth/cadastro", {
      method: "POST",
      body: JSON.stringify({
        nome: String(form.get("nome") ?? ""),
        email: String(form.get("email") ?? ""),
        senha: String(form.get("senha") ?? "")
      })
    });
    setEnviando(false);
    if (!ok) {
      setErro(mensagemErro(dados, "Este e-mail já está cadastrado. Nenhuma conta nova foi criada."));
      return;
    }
    router.replace("/login");
  }

  return (
    <AuthShell>
      <div className="mb-6 md:hidden">
        <LogoHorizontal />
      </div>
      <h2 className="text-xl font-semibold leading-snug">Criar conta de aluno</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">
        O cadastro público cria conta de aluno. A conta da administradora não é criada por aqui.
      </p>
      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        {erro ? <Alerta texto={erro} /> : null}
        <Campo label="Nome" type="text" name="nome" placeholder="Lucas Almeida" autoComplete="name" />
        <Campo label="E-mail" type="email" name="email" placeholder="lucas@exemplo.com" autoComplete="email" />
        <Campo label="Senha" type="password" name="senha" placeholder="••••••••" autoComplete="new-password" />
        <Botao disabled={enviando}>{enviando ? "Cadastrando…" : "Cadastrar"}</Botao>
        <button
          type="button"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium leading-snug text-slate-700 hover:bg-slate-50"
          onClick={() => router.push("/login")}
        >
          Voltar ao login
        </button>
      </form>
    </AuthShell>
  );
}
