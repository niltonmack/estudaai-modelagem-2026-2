"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell, Alerta, Botao, Campo } from "@/components/auth-ui";
import { LogoHorizontal } from "@/components/logo";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { salvarSessao } from "@/lib/sessao";
import { destinoSeguro } from "@/lib/progresso";

export default function LoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const form = new FormData(e.currentTarget);
      const { ok, dados } = await chamarApi<{
        accessToken: string;
        perfil: "aluno" | "administrador";
        nome: string;
        email: string;
      } & ErroApi>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          senha: String(form.get("senha") ?? "")
        })
      });
      if (!ok || !("accessToken" in dados) || !dados.accessToken) {
        setErro(mensagemErro(dados, "E-mail ou senha inválidos. Nenhuma sessão foi iniciada."));
        return;
      }
      salvarSessao({
        accessToken: dados.accessToken,
        perfil: dados.perfil,
        nome: dados.nome,
        email: dados.email
      });
      const next = destinoSeguro(new URLSearchParams(window.location.search).get("next"));
      router.replace(
        dados.perfil === "administrador" ? "/painel" : next ?? "/inicio"
      );
    } catch {
      setErro("Não foi possível conectar. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-6 md:hidden">
        <LogoHorizontal />
      </div>
      <h2 className="text-xl font-semibold leading-snug">Entrar</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">Aluno ou administrador, cada um no seu perfil.</p>
      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        {erro ? <Alerta texto={erro} /> : null}
        <Campo label="E-mail" type="email" name="email" placeholder="lucas@exemplo.com" autoComplete="email" />
        <Campo label="Senha" type="password" name="senha" placeholder="••••••••" autoComplete="current-password" />
        <Botao disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</Botao>
      </form>
      <div className="mt-4 space-y-2 text-sm">
        <p>
          <Link className="text-brand-trail underline" href="/cadastro">
            Criar conta de aluno
          </Link>
        </p>
        <p>
          <Link className="text-slate-600 underline" href="/catalogo">
            Ver catálogo sem conta
          </Link>
        </p>
        <p>
          <Link className="text-slate-600 underline" href="/recuperacao">
            Esqueci a senha
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
