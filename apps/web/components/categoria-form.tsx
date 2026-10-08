"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { Categoria } from "@/lib/catalogo";

export function CategoriaForm({
  token,
  inicial
}: {
  token: string;
  inicial?: Categoria;
}) {
  const router = useRouter();
  const criar = !inicial;
  const sentinela = inicial?.sentinela === true;
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    const corpo = {
      nome: String(form.get("nome") ?? ""),
      descricao: String(form.get("descricao") ?? "")
    };
    try {
      const { ok, dados } = inicial
        ? await chamarApi<Categoria & ErroApi>(`/categorias/${inicial.id}`, {
            method: "PATCH",
            token,
            body: JSON.stringify(corpo)
          })
        : await chamarApi<Categoria & ErroApi>("/categorias", {
            method: "POST",
            token,
            body: JSON.stringify(corpo)
          });
      if (!ok) {
        setErro(mensagemErro(dados, "Não foi possível gravar a categoria."));
        return;
      }
      router.replace("/categorias");
    } catch {
      setErro("Não foi possível falar com a API.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <p className="text-sm text-slate-500">
        <Link className="text-brand-trail underline" href="/categorias">
          ← Categorias
        </Link>
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-snug">{criar ? "Nova categoria" : "Editar categoria"}</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        {criar
          ? "Nome e descrição são obrigatórios."
          : "Altere nome e descrição. Na categoria Personalizada, o nome permanece e só a descrição pode mudar."}
      </p>
      <form className="mt-6 max-w-lg space-y-4" onSubmit={(e) => void onSubmit(e)}>
        {erro ? <Alerta texto={erro} /> : null}
        <label className="block text-sm font-medium leading-snug text-slate-700">
          Nome
          <input
            type="text"
            name="nome"
            defaultValue={inicial?.nome ?? ""}
            placeholder="Ex.: Ciências da natureza"
            required
            readOnly={sentinela}
            className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2 read-only:bg-slate-50"
          />
        </label>
        <label className="block text-sm font-medium leading-snug text-slate-700">
          Descrição
          <textarea
            name="descricao"
            rows={3}
            defaultValue={inicial?.descricao ?? ""}
            required
            className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2"
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60 sm:w-auto"
          >
            {enviando ? "Salvando…" : criar ? "Cadastrar" : "Salvar alterações"}
          </button>
          <Link
            href="/categorias"
            className="inline-block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
