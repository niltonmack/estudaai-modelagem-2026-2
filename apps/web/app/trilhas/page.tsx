"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { lerSessao, Sessao } from "@/lib/sessao";
import { Trilha } from "@/lib/trilha";

export default function TrilhasPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [lista, setLista] = useState<Trilha[]>([]);
  const [alerta, setAlerta] = useState<string | null>(null);
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
    const { ok, dados } = await chamarApi<Trilha[] & ErroApi>("/trilhas", { token });
    if (!ok) {
      setAlerta(mensagemErro(dados, "Não foi possível listar as trilhas."));
      setLista([]);
    } else {
      setLista(Array.isArray(dados) ? dados : []);
    }
    setCarregando(false);
  }

  async function publicar(trilha: Trilha) {
    if (!sessao) return;
    setAlerta(null);
    const { ok, dados } = await chamarApi<Trilha & ErroApi>(`/trilhas/${trilha.id}/publicar`, {
      method: "POST",
      token: sessao.accessToken
    });
    if (!ok) {
      setAlerta(mensagemErro(dados, "Não foi possível disponibilizar a trilha."));
      return;
    }
    await carregar(sessao.accessToken);
  }

  async function remover(trilha: Trilha) {
    if (!sessao) return;
    setAlerta(null);
    const { ok, dados } = await chamarApi<ErroApi>(`/trilhas/${trilha.id}`, {
      method: "DELETE",
      token: sessao.accessToken
    });
    if (!ok) {
      setAlerta(mensagemErro(dados, "Não foi possível remover a trilha."));
      return;
    }
    await carregar(sessao.accessToken);
  }

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Trilhas pré-definidas</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
            Percursos do catálogo. As trilhas geradas pelo agente não aparecem nesta lista.
          </p>
        </div>
        <Link
          href="/trilhas/nova"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark"
        >
          Nova trilha
        </Link>
      </div>
      {alerta ? (
        <div className="mt-4">
          <Alerta texto={alerta} />
        </div>
      ) : null}
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {carregando ? (
          <p className="px-4 py-6 text-sm text-slate-500">Carregando trilhas…</p>
        ) : (
          <table className="w-full min-w-0 text-left text-sm max-sm:block">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 max-sm:hidden">
              <tr>
                <th className="px-4 py-2 font-medium">Título</th>
                <th className="px-4 py-2 font-medium">Categoria</th>
                <th className="px-4 py-2 font-medium">Etapas</th>
                <th className="px-4 py-2 font-medium">Situação</th>
                <th className="px-4 py-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 max-sm:block">
              {lista.map((trilha) => (
                <tr
                  key={trilha.id}
                  className="max-sm:mb-3 max-sm:block max-sm:w-full max-sm:rounded-lg max-sm:border max-sm:border-slate-200 max-sm:p-3"
                >
                  <td className="px-4 py-3 font-medium text-brand-ink max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    {trilha.titulo}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    {trilha.categoria.nome}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    {trilha.quantidadeEtapas}
                  </td>
                  <td className="px-4 py-3 max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    {trilha.disponivel ? (
                      <span className="rounded-full bg-brand-mint px-2 py-0.5 text-xs font-medium text-brand-trail">
                        Publicada
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Incompleta
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    <Link className="text-brand-trail underline" href={`/trilhas/${trilha.id}`}>
                      Editar
                    </Link>
                    {trilha.quantidadeEtapas > 1 ? (
                      <Link className="ml-3 text-brand-trail underline" href={`/trilhas/${trilha.id}/ordem`}>
                        Reordenar
                      </Link>
                    ) : null}
                    {trilha.disponivel ? null : (
                      <button type="button" className="ml-3 text-brand-trail underline" onClick={() => void publicar(trilha)}>
                        Disponibilizar
                      </button>
                    )}
                    <button type="button" className="ml-3 text-red-700 underline" onClick={() => void remover(trilha)}>
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
        A trilha só aparece para o aluno com categoria e ao menos uma etapa. Se alguém já acompanha, a etapa em uso não é apagada.
      </p>
    </AppShell>
  );
}
