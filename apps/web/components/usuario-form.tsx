"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { UsuarioConta } from "@/lib/usuarios";

export function UsuarioForm({
  token,
  inicial
}: {
  token: string;
  inicial?: UsuarioConta;
}) {
  const router = useRouter();
  const criar = !inicial;
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    const senha = String(form.get("senha") ?? "");
    const corpo: Record<string, string> = {
      nome: String(form.get("nome") ?? ""),
      email: String(form.get("email") ?? ""),
      perfil: String(form.get("perfil") ?? "aluno")
    };
    if (criar || senha) corpo.senha = senha;
    try {
      const { ok, dados } = inicial
        ? await chamarApi<UsuarioConta & ErroApi>(`/usuarios/${inicial.id}`, {
            method: "PATCH",
            token,
            body: JSON.stringify(corpo)
          })
        : await chamarApi<UsuarioConta & ErroApi>("/usuarios", {
            method: "POST",
            token,
            body: JSON.stringify(corpo)
          });
      if (!ok) {
        setErro(mensagemErro(dados, "Não foi possível gravar a conta."));
        return;
      }
      router.replace("/usuarios");
    } catch {
      setErro("Não foi possível falar com a API.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <p className="text-sm text-slate-500">
        <Link className="text-brand-trail underline" href="/usuarios">
          ← Usuários
        </Link>
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-snug">{criar ? "Nova conta" : "Editar conta"}</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        {criar
          ? "Escolha se a conta é de aluno ou de administrador. A senha fica protegida; ninguém a vê depois."
          : "Altere nome, e-mail, senha ou perfil. Deixe a senha em branco para mantê-la."}
      </p>
      <form className="mt-6 max-w-lg space-y-4" onSubmit={(e) => void onSubmit(e)}>
        {erro ? <Alerta texto={erro} /> : null}
        <label className="block text-sm font-medium leading-snug text-slate-700">
          Nome
          <input
            type="text"
            name="nome"
            defaultValue={inicial?.nome ?? ""}
            required
            className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium leading-snug text-slate-700">
          E-mail
          <input
            type="email"
            name="email"
            defaultValue={inicial?.email ?? ""}
            required
            className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium leading-snug text-slate-700">
          Senha
          <input
            type="password"
            name="senha"
            required={criar}
            placeholder={criar ? "" : "Deixe em branco para manter"}
            className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium leading-snug text-slate-700">
          Perfil
          <select
            name="perfil"
            defaultValue={inicial?.perfil ?? "aluno"}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="aluno">Aluno</option>
            <option value="administrador">Administrador</option>
          </select>
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex w-full items-center justify-center rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60 sm:w-auto"
          >
            {enviando ? "Salvando…" : criar ? "Cadastrar" : "Salvar alterações"}
          </button>
          <Link
            href="/usuarios"
            className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
