"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { Categoria } from "@/lib/catalogo";
import { Etapa, ImpactoRemocao, Trilha } from "@/lib/trilha";

type EtapaLocal = { chave: string; id?: string; titulo: string; conteudo: string };

export function TrilhaForm({
  token,
  inicial,
  reordenar = false
}: {
  token: string;
  inicial?: Trilha;
  reordenar?: boolean;
}) {
  const router = useRouter();
  const criar = !inicial;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [etapas, setEtapas] = useState<EtapaLocal[]>(
    (inicial?.etapas ?? []).map((e) => ({ chave: e.id, id: e.id, titulo: e.titulo, conteudo: e.conteudo }))
  );
  const [erro, setErro] = useState<string | null>(null);
  const [impacto, setImpacto] = useState<ImpactoRemocao | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    void (async () => {
      const { ok, dados } = await chamarApi<Categoria[] & ErroApi>("/categorias", { token });
      if (ok && Array.isArray(dados)) {
        setCategorias(dados.filter((c) => !c.sentinela));
      }
    })();
  }, [token]);

  function mover(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= etapas.length) return;
    const copia = [...etapas];
    const [item] = copia.splice(indice, 1);
    copia.splice(destino, 0, item);
    setEtapas(copia);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setImpacto(null);
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    const corpo = {
      titulo: String(form.get("titulo") ?? ""),
      descricao: String(form.get("descricao") ?? ""),
      categoriaId: String(form.get("categoriaId") ?? "")
    };
    try {
      if (reordenar && inicial) {
        const { ok, dados } = await chamarApi<Trilha & ErroApi>(`/trilhas/${inicial.id}/etapas/ordem`, {
          method: "PATCH",
          token,
          body: JSON.stringify({ ids: etapas.map((et) => et.id).filter(Boolean) })
        });
        if (!ok) {
          setErro(mensagemErro(dados, "Não foi possível gravar a sequência."));
          return;
        }
        router.replace("/trilhas");
        return;
      }

      let trilhaId = inicial?.id;
      if (criar) {
        const { ok, dados } = await chamarApi<Trilha & ErroApi>("/trilhas", {
          method: "POST",
          token,
          body: JSON.stringify(corpo)
        });
        if (!ok) {
          setErro(mensagemErro(dados, "Não foi possível criar a trilha."));
          return;
        }
        trilhaId = dados.id;
        for (const etapa of etapas) {
          const etapaOk = await chamarApi<Trilha & ErroApi>(`/trilhas/${trilhaId}/etapas`, {
            method: "POST",
            token,
            body: JSON.stringify({ titulo: etapa.titulo, conteudo: etapa.conteudo })
          });
          if (!etapaOk.ok) {
            setErro(mensagemErro(etapaOk.dados, "Não foi possível gravar uma etapa."));
            return;
          }
        }
      } else if (trilhaId) {
        const { ok, dados } = await chamarApi<Trilha & ErroApi>(`/trilhas/${trilhaId}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(corpo)
        });
        if (!ok) {
          setErro(mensagemErro(dados, "Não foi possível alterar a trilha."));
          return;
        }
        for (const etapa of etapas) {
          if (!etapa.id) {
            const nova = await chamarApi<Trilha & ErroApi>(`/trilhas/${trilhaId}/etapas`, {
              method: "POST",
              token,
              body: JSON.stringify({ titulo: etapa.titulo, conteudo: etapa.conteudo })
            });
            if (!nova.ok) {
              setErro(mensagemErro(nova.dados, "Não foi possível gravar uma etapa."));
              return;
            }
          } else {
            const alt = await chamarApi<Trilha & ErroApi>(`/trilhas/${trilhaId}/etapas/${etapa.id}`, {
              method: "PATCH",
              token,
              body: JSON.stringify({ titulo: etapa.titulo, conteudo: etapa.conteudo })
            });
            if (!alt.ok) {
              setErro(mensagemErro(alt.dados, "Não foi possível alterar uma etapa."));
              return;
            }
          }
        }
      }

      const pub = await chamarApi<Trilha & ErroApi>(`/trilhas/${trilhaId}/publicar`, { method: "POST", token });
      if (!pub.ok) {
        setErro(mensagemErro(pub.dados, "Não foi possível disponibilizar a trilha."));
        return;
      }
      router.replace("/trilhas");
    } catch {
      setErro("Não foi possível falar com a API.");
    } finally {
      setEnviando(false);
    }
  }

  async function removerEtapa(etapa: EtapaLocal) {
    if (!inicial || !etapa.id) {
      setEtapas((atual) => atual.filter((e) => e.chave !== etapa.chave));
      return;
    }
    setErro(null);
    setImpacto(null);
    const { ok, dados } = await chamarApi<
      Trilha & ErroApi & { remocaoRecusada?: boolean; impacto?: ImpactoRemocao }
    >(`/trilhas/${inicial.id}/etapas/${etapa.id}`, {
      method: "DELETE",
      token
    });
    if (!ok) {
      setErro(mensagemErro(dados, "Não foi possível remover a etapa."));
      if (dados.impacto) setImpacto(dados.impacto);
      return;
    }
    setEtapas((dados.etapas ?? []).map((e: Etapa) => ({ chave: e.id, id: e.id, titulo: e.titulo, conteudo: e.conteudo })));
  }

  const tituloPagina = criar ? "Nova trilha pré-definida" : reordenar ? "Reordenar etapas" : "Editar trilha e etapas";
  const intro = criar
    ? "Informe título, descrição, categoria e pelo menos uma etapa."
    : reordenar
      ? "Ao reordenar, cada etapa conserva o próprio conteúdo. Conclusões já registradas continuam ligadas à etapa."
      : "Altere título, descrição, categoria e etapas. Para publicar, a trilha precisa de categoria e ao menos uma etapa.";

  return (
    <>
      <p className="text-sm text-slate-500">
        <Link className="text-brand-trail underline" href="/trilhas">
          ← Trilhas pré-definidas
        </Link>
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-snug">{tituloPagina}</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{intro}</p>
      <form className="mt-6 max-w-2xl space-y-4" onSubmit={(e) => void onSubmit(e)}>
        {erro ? <Alerta texto={erro} /> : null}
        {impacto ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-brand-ink">Impacto identificado</p>
            <p className="mt-1 text-xs text-slate-500">
              Consulta antes de apagar. Etapa em uso por alunos não é removida.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
              <li>
                {impacto.progressosVigentes === 1 ? "Há 1 aluno acompanhando" : `Há ${impacto.progressosVigentes} alunos acompanhando`} esta
                trilha
                {impacto.alunos.length
                  ? ` (${impacto.alunos.map((a) => a.nome).join(", ")})`
                  : ""}
                .
              </li>
              <li>
                {impacto.conclusoesDestaEtapa === 1
                  ? "Há 1 conclusão desta etapa no histórico."
                  : `Há ${impacto.conclusoesDestaEtapa} conclusões desta etapa no histórico.`}
              </li>
              {impacto.alunos.map((aluno) => (
                <li key={aluno.nome}>
                  O percentual de {aluno.nome} continua{" "}
                  <strong>
                    {aluno.etapasConcluidas} de {aluno.totalEtapas}
                  </strong>
                  .
                  {aluno.concluiuEstaEtapa ? "" : " Esta etapa ainda não entra no percentual deste aluno."}
                </li>
              ))}
              {impacto.ultimaEtapa ? (
                <li>A trilha ficaria sem etapas. A etapa em uso permanece.</li>
              ) : (
                <li>As etapas continuam na trilha, na mesma ordem.</li>
              )}
            </ul>
          </div>
        ) : null}
        <label className="block text-sm font-medium leading-snug text-slate-700">
          Título
          <input
            type="text"
            name="titulo"
            defaultValue={inicial?.titulo ?? ""}
            placeholder="Ex.: Introdução à lógica"
            required
            readOnly={reordenar}
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
            readOnly={reordenar}
            className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2 read-only:bg-slate-50"
          />
        </label>
        <label className="block text-sm font-medium leading-snug text-slate-700">
          Categoria
          <select
            name="categoriaId"
            defaultValue={inicial?.categoria.id ?? ""}
            required
            disabled={reordenar}
            className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2 disabled:bg-slate-50"
          >
            <option value="">Selecione</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs leading-relaxed text-slate-500">
          A categoria <strong>Personalizada</strong> não aparece aqui: ela é reservada às trilhas geradas pelo agente.
        </p>
        <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Estas são trilhas do catálogo, montadas por você.
        </p>
        <div className="border-t border-slate-200 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Etapas</h3>
              <p className="text-sm text-slate-600">
                Defina a ordem das etapas. Sem etapas, a trilha não entra no catálogo.
              </p>
            </div>
            {reordenar ? null : (
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() =>
                  setEtapas((atual) => [
                    ...atual,
                    { chave: `nova-${atual.length}-${Date.now()}`, titulo: "", conteudo: "" }
                  ])
                }
              >
                Adicionar etapa
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {etapas.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Nenhuma etapa ainda. Sem etapas, a trilha não aparece para o aluno.
              </p>
            ) : (
              etapas.map((etapa, indice) => (
                <article
                  key={etapa.chave}
                  className={`rounded-lg border border-slate-200 bg-white p-4 ${
                    impacto?.etapaId === etapa.id ? "ring-2 ring-red-300" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-brand-trail">
                      Etapa <span className="tabular-nums">{indice + 1}</span>
                    </p>
                    {reordenar ? (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          disabled={indice === 0}
                          onClick={() => mover(indice, -1)}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={indice === etapas.length - 1}
                          onClick={() => mover(indice, 1)}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-40"
                        >
                          ↓
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3 space-y-3">
                    <label className="block text-sm font-medium leading-snug text-slate-700">
                      Título da etapa
                      <input
                        type="text"
                        required
                        readOnly={reordenar}
                        value={etapa.titulo}
                        onChange={(ev) =>
                          setEtapas((atual) =>
                            atual.map((item) => (item.chave === etapa.chave ? { ...item, titulo: ev.target.value } : item))
                          )
                        }
                        className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2 read-only:bg-slate-50"
                      />
                    </label>
                    <label className="block text-sm font-medium leading-snug text-slate-700">
                      Conteúdo da etapa
                      <textarea
                        rows={4}
                        required
                        readOnly={reordenar}
                        value={etapa.conteudo}
                        onChange={(ev) =>
                          setEtapas((atual) =>
                            atual.map((item) =>
                              item.chave === etapa.chave ? { ...item, conteudo: ev.target.value } : item
                            )
                          )
                        }
                        className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2 read-only:bg-slate-50"
                      />
                    </label>
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Etapa {indice + 1}</span>
                    {reordenar ? null : (
                      <button type="button" className="text-red-700 underline" onClick={() => void removerEtapa(etapa)}>
                        Remover
                      </button>
                    )}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60 sm:w-auto"
          >
            {enviando ? "Salvando…" : reordenar ? "Salvar sequência" : criar ? "Publicar no catálogo" : "Salvar e publicar"}
          </button>
          <Link
            href="/trilhas"
            className="inline-block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Cancelar
          </Link>
        </div>
      </form>
      <p className="mt-6 text-xs text-slate-500">
        O aluno não vê esta tela. Se alguém já acompanha a trilha, a etapa em uso não é apagada.
      </p>
    </>
  );
}
