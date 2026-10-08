"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell, Alerta, Botao, Campo } from "@/components/auth-ui";
import { LogoHorizontal } from "@/components/logo";
import { chamarApi } from "@/lib/api";

export default function RecuperacaoPage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    await chamarApi("/auth/recuperacao", {
      method: "POST",
      body: JSON.stringify({ email: String(form.get("email") ?? "") })
    });
    setEnviando(false);
    setOk(true);
  }

  return (
    <AuthShell>
      <div className="mb-6 md:hidden">
        <LogoHorizontal />
      </div>
      {ok ? (
        <>
          <h2 className="text-xl font-semibold leading-snug">Verifique seu e-mail</h2>
          <div className="mt-6 space-y-4">
            <Alerta
              tom="green"
              texto="Se o e-mail estiver cadastrado, o procedimento de redefinição foi enviado."
            />
            <p className="text-sm leading-relaxed text-slate-600">
              Por segurança, não informamos se o e-mail está cadastrado.
            </p>
            <button
              type="button"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium leading-snug text-slate-700 hover:bg-slate-50"
              onClick={() => router.push("/login")}
            >
              Voltar ao login
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold leading-snug">Recuperar senha</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Enviamos o procedimento para o e-mail cadastrado.
          </p>
          <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <Campo label="E-mail" type="email" name="email" placeholder="lucas@exemplo.com" autoComplete="email" />
            <Botao disabled={enviando}>{enviando ? "Enviando…" : "Enviar procedimento"}</Botao>
            <button
              type="button"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium leading-snug text-slate-700 hover:bg-slate-50"
              onClick={() => router.push("/login")}
            >
              Voltar ao login
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
