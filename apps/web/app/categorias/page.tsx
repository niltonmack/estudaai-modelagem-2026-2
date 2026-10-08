"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { Categoria } from "@/lib/catalogo";
import { lerSessao, Sessao } from "@/lib/sessao";

export default function CategoriasPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [lista, setLista] = useState<Categoria[]>([]);
  const [alerta, setAlerta] = useState<{ texto: string; tom: "red" | "amber" } | null>(null);
  const [carregando, setCarregando] = useState(true);

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

  useEffect(() => {
    if (!sessao) return;
    void carregar(sessao.accessToken);
  }, [sessao]);

  async function carregar(token: string) {
    setCarregando(true);
    const { ok, dados } = await chamarApi<Categoria[] & ErroApi>("/categorias", { token });
    if (!ok) {
      setAlerta({ texto: mensagemErro(dados, "Não foi possível listar as categorias."), tom: "red" });
      setLista([]);
    } else {
      setLista(Array.isArray(dados) ? dados : []);
    }
    setCarregando(false);
  }

  async function remover(categoria: Categoria) {
    if (!sessao) return;
    setAlerta(null);
    const { ok, dados } = await chamarApi<ErroApi>(`/categorias/${categoria.id}`, {
      method: "DELETE",
      token: sessao.accessToken
    });
    if (!ok) {
      const texto = mensagemErro(dados, "Não foi possível remover a categoria.");
      setAlerta({ texto, tom: categoria.sentinela || texto.includes("Personalizada") ? "amber" : "red" });
      return;
    }
    await carregar(sessao.accessToken);
  }

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Categorias</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
            Áreas do catálogo. Só a administradora altera. A categoria <strong>Personalizada</strong> é reservada às
            trilhas geradas pelo agente; o aluno não a escolhe.
          </p>
        </div>
        <Link
          href="/categorias/nova"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark"
        >
          Nova categoria
        </Link>
      </div>
      {alerta ? (
        <div className="mt-4">
          <Alerta texto={alerta.texto} tom={alerta.tom} />
        </div>
      ) : null}
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {carregando ? (
          <p className="px-4 py-6 text-sm text-slate-500">Carregando categorias…</p>
        ) : (
          <table className="w-full min-w-0 text-left text-sm max-sm:block">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 max-sm:hidden">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Descrição</th>
                <th className="px-4 py-2 font-medium">Trilhas</th>
                <th className="px-4 py-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 max-sm:block">
              {lista.map((categoria) => (
                <tr
                  key={categoria.id}
                  className={`max-sm:mb-3 max-sm:block max-sm:w-full max-sm:rounded-lg max-sm:border max-sm:border-slate-200 max-sm:p-3 ${
                    categoria.sentinela ? "bg-brand-mint/40" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-brand-ink max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    {categoria.nome}
                    {categoria.sentinela ? (
                      <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-normal text-brand-trail">
                        reservada
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    {categoria.descricao}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    {categoria.quantidadeTrilhas}
                  </td>
                  <td className="px-4 py-3 max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    <Link className="text-brand-trail underline" href={`/categorias/${categoria.id}`}>
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="ml-3 text-red-700 underline"
                      onClick={() => void remover(categoria)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Uma categoria com trilhas não pode ser removida.
      </p>
    </AppShell>
  );
}
