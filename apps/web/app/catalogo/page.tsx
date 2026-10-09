"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { CascaPublica } from "@/components/casca-publica";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { CatalogoPublico, ProgressoLista, ResultadoBusca } from "@/lib/progresso";
import { lerSessao, Sessao } from "@/lib/sessao";

function CatalogoConteudo() {
  const router = useRouter();
  const params = useSearchParams();
  const [sessao, setSessao] = useState<Sessao | null | undefined>(undefined);
  const [catalogo, setCatalogo] = useState<CatalogoPublico | null>(null);
  const [meus, setMeus] = useState<ProgressoLista[]>([]);
  const [alerta, setAlerta] = useState<{ texto: string; tom: "red" | "amber" | "green" } | null>(null);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [pergunta, setPergunta] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<ResultadoBusca[] | null>(null);

  useEffect(() => {
    const atual = lerSessao();
    if (atual?.perfil === "administrador") {
      router.replace("/painel");
      return;
    }
    setSessao(atual);
  }, [router]);

  useEffect(() => {
    if (sessao === undefined) return;
    void carregar();
  }, [sessao]);

  useEffect(() => {
    if (params.get("recusa") === "1") {
      setAlerta({
        texto: "Para escolher uma trilha e registrar progresso, entre como aluno. Você ainda pode ver o catálogo sem conta.",
        tom: "red"
      });
    }
  }, [params]);

  async function carregar() {
    const { ok, dados } = await chamarApi<CatalogoPublico & ErroApi>("/catalogo");
    if (!ok) {
      setAlerta({ texto: mensagemErro(dados, "Não foi possível listar o catálogo."), tom: "red" });
      return;
    }
    setCatalogo(dados);
    if (sessao?.perfil === "aluno") {
      const prog = await chamarApi<ProgressoLista[] & ErroApi>("/progresso", { token: sessao.accessToken });
      if (prog.ok && Array.isArray(prog.dados)) setMeus(prog.dados);
    }
  }

  const porTrilha = useMemo(() => {
    const mapa = new Map<string, ProgressoLista>();
    for (const p of meus) mapa.set(p.trilha.id, p);
    return mapa;
  }, [meus]);

  const personalizadas = useMemo(
    () => meus.filter((item) => item.trilha.tipo === "personalizada"),
    [meus]
  );

  async function escolher(trilhaId: string) {
    if (!sessao) {
      setAlerta({
        texto: "Para escolher uma trilha e registrar progresso, entre como aluno. Você ainda pode ver o catálogo sem conta.",
        tom: "red"
      });
      router.replace("/catalogo?recusa=1");
      return;
    }
    setEnviando(trilhaId);
    setAlerta(null);
    const existente = porTrilha.get(trilhaId);
    if (existente) {
      router.push(`/progresso/${existente.id}`);
      return;
    }
    const { ok, dados } = await chamarApi<ProgressoLista & { id: string } & ErroApi>("/progresso/escolher-trilha", {
      method: "POST",
      token: sessao.accessToken,
      body: JSON.stringify({ trilhaId })
    });
    setEnviando(null);
    if (!ok || !("id" in dados) || !dados.id) {
      setAlerta({ texto: mensagemErro(dados, "Não foi possível iniciar o progresso."), tom: "red" });
      return;
    }
    router.push(`/progresso/${dados.id}`);
  }

  if (sessao === undefined) return null;

  async function buscar(evento: FormEvent) {
    evento.preventDefault();
    if (!sessao || sessao.perfil !== "aluno") return;
    setBuscando(true);
    setAlerta(null);
    const { ok, dados } = await chamarApi<{ resultados: ResultadoBusca[] } & ErroApi>("/busca", {
      method: "POST",
      token: sessao.accessToken,
      body: JSON.stringify({ texto: pergunta })
    });
    setBuscando(false);
    if (!ok) {
      setResultados(null);
      setAlerta({
        texto: mensagemErro(dados, "A busca não respondeu. Tente de novo. Suas trilhas não foram alteradas."),
        tom: "red"
      });
      return;
    }
    setResultados(dados.resultados ?? []);
  }

  const intro = sessao
    ? "Trilhas organizadas por categoria. A busca olha as publicadas e as personalizadas que alguém deixou disponíveis."
    : "Você pode ver o catálogo sem conta. Para começar uma trilha ou buscar pelo conteúdo, entre como aluno.";

  const inner = (
    <>
      <h2 className="text-2xl font-semibold">Catálogo</h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">{intro}</p>
      {alerta ? (
        <div className="mt-4">
          <Alerta texto={alerta.texto} tom={alerta.tom} />
          {!sessao ? (
            <p className="mt-3 text-sm">
              <Link className="text-brand-trail underline" href="/login?next=/catalogo">
                Ir para o login
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
      {sessao?.perfil === "aluno" ? (
        <form className="mt-4 rounded-lg border border-slate-200 bg-white p-4" onSubmit={(e) => void buscar(e)}>
          <label className="block text-sm font-medium text-brand-ink" htmlFor="busca-conteudo">
            Buscar pelo conteúdo
          </label>
          <textarea
            id="busca-conteudo"
            rows={2}
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Como calcular juros simples e compostos?"
          />
          <button
            type="submit"
            disabled={buscando || !pergunta.trim()}
            className="mt-3 inline-flex rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60"
          >
            {buscando ? "Buscando…" : "Buscar"}
          </button>
        </form>
      ) : null}
      {resultados ? (
        <section className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resultado da busca</h3>
          {resultados.length === 0 ? (
            <p className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              Nenhuma etapa próxima dessa pergunta. As categorias continuam abaixo.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {resultados.map((item) => (
                <article key={`${item.trilhaId}-${item.etapaId}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-trail">
                    {item.tituloTrilha}
                    {item.tipo === "personalizada" ? " · personalizada" : " · pré-definida"}
                    {item.autorNome ? ` · por ${item.autorNome}` : ""}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-brand-ink">{item.tituloEtapa}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.trecho}</p>
                  {item.progressoId ? (
                    <Link
                      href={`/progresso/${item.progressoId}`}
                      className="mt-3 inline-flex rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark"
                    >
                      Abrir
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={enviando === item.trilhaId}
                      onClick={() => void escolher(item.trilhaId)}
                      className="mt-3 inline-flex rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60"
                    >
                      {enviando === item.trilhaId ? "Abrindo…" : "Começar"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
      {catalogo === null ? (
        <p className="mt-6 text-sm text-slate-500">Carregando catálogo…</p>
      ) : catalogo.indisponivel ? (
        <div className="mt-4">
          <Alerta
            texto="Por enquanto não há trilhas publicadas e o agente está desligado. Nenhuma trilha nova foi criada."
            tom="amber"
          />
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
            Quando houver trilhas publicadas ou o agente for ligado, esta tela deixa de aparecer vazia.
          </p>
        </div>
      ) : (
        <>
          {personalizadas.length > 0 ? (
            <section className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Suas trilhas personalizadas
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {personalizadas.map((item) => (
                  <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-brand-trail">Personalizada</p>
                    <h3 className="mt-1 text-lg font-semibold text-brand-ink">{item.trilha.titulo}</h3>
                    <p className="mt-2 text-xs text-slate-500">
                      {item.etapasConcluidas} de {item.totalEtapas} etapas
                      {item.proximaEtapa ? ` · próxima: ${item.proximaEtapa.titulo}` : " · concluída"}
                    </p>
                    <Link
                      href={`/progresso/${item.id}`}
                      className="mt-3 inline-flex rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark"
                    >
                      Abrir trilha
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
          {catalogo.categorias.map((categoria) => (
          <section key={categoria.id} className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{categoria.nome}</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {categoria.trilhas.map((trilha) => {
                const progresso = porTrilha.get(trilha.id);
                const acao = !sessao ? "Escolher trilha" : progresso ? "Continuar" : "Começar";
                return (
                  <article key={trilha.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-brand-trail">
                      {categoria.nome}
                      {trilha.autorNome ? ` · por ${trilha.autorNome}` : ""}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-brand-ink">{trilha.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{trilha.descricao}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {trilha.quantidadeEtapas} etapas ordenadas · pré-definida
                    </p>
                    <button
                      type="button"
                      disabled={enviando === trilha.id}
                      onClick={() => void escolher(trilha.id)}
                      className="mt-3 inline-flex rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60"
                    >
                      {enviando === trilha.id ? "Abrindo…" : acao}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
        </>
      )}
      <p className="mt-6 text-xs text-slate-500">
        A lista por categoria traz trilhas publicadas e personalizadas que o autor deixou disponíveis. As suas, ainda
        privadas, ficam em Suas trilhas personalizadas e em Meu progresso.
      </p>
    </>
  );

  if (!sessao) return <CascaPublica>{inner}</CascaPublica>;
  return (
    <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
      {inner}
    </AppShell>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogoConteudo />
    </Suspense>
  );
}
