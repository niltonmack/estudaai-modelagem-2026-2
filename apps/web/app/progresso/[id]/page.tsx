"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { ConversaPainel } from "@/components/conversa-painel";
import { Lightbox } from "@/components/lightbox";
import { BarraProgresso, MarkdownEtapa } from "@/components/markdown-etapa";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { partirConteudo } from "@/lib/etapa-conteudo";
import { dataPt, EtapaProgresso, ProgressoDetalhe } from "@/lib/progresso";
import { lerSessao, Sessao } from "@/lib/sessao";

function selo(etapa: EtapaProgresso, atual: boolean) {
  if (etapa.concluida) {
    return (
      <span className="rounded-full bg-brand-mint px-2 py-0.5 text-xs font-medium text-brand-trail">
        Concluída{etapa.dataConclusao ? ` em ${dataPt(etapa.dataConclusao)}` : ""}
      </span>
    );
  }
  if (atual) {
    return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">Próxima</span>;
  }
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">A seguir</span>;
}

export default function ProgressoDetalhePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [detalhe, setDetalhe] = useState<ProgressoDetalhe | null>(null);
  const [alerta, setAlerta] = useState<{ texto: string; tom: "red" | "green" | "amber" } | null>(null);
  const [marcando, setMarcando] = useState(false);
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});
  const [resposta, setResposta] = useState<{ titulo: string; texto: string } | null>(null);
  const [conversaAberta, setConversaAberta] = useState(false);
  const [ajusteAberto, setAjusteAberto] = useState(false);
  const [promptAjuste, setPromptAjuste] = useState("");
  const [ajustando, setAjustando] = useState(false);
  const [disponibilizando, setDisponibilizando] = useState(false);

  useEffect(() => {
    const atual = lerSessao();
    if (!atual) {
      router.replace(`/login?next=/progresso/${params.id}`);
      return;
    }
    if (atual.perfil !== "aluno") {
      router.replace("/painel");
      return;
    }
    setSessao(atual);
  }, [router, params.id]);

  useEffect(() => {
    if (!sessao) return;
    void carregar(sessao.accessToken);
  }, [sessao, params.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("criada") === "1") {
      setAlerta({
        texto:
          "Trilha personalizada criada a partir do seu objetivo. Ela fica só com você até você deixá-la disponível para todos.",
        tom: "green"
      });
    }
  }, []);

  async function carregar(token: string) {
    const { ok, dados } = await chamarApi<ProgressoDetalhe & ErroApi>(`/progresso/${params.id}`, { token });
    if (!ok) {
      setAlerta({ texto: mensagemErro(dados, "Não foi possível abrir este progresso."), tom: "red" });
      setDetalhe(null);
      return;
    }
    setDetalhe(dados);
  }

  async function concluir(etapaId: string, titulo: string) {
    if (!sessao) return;
    setMarcando(true);
    setAlerta(null);
    const { ok, dados } = await chamarApi<ProgressoDetalhe & ErroApi>(
      `/progresso/${params.id}/etapas/${etapaId}/conclusao`,
      { method: "POST", token: sessao.accessToken }
    );
    setMarcando(false);
    if (!ok) {
      setAlerta({ texto: mensagemErro(dados, "Não foi possível marcar a etapa."), tom: "red" });
      return;
    }
    setDetalhe(dados);
    setAlerta({
      texto: `Etapa «${titulo}» registrada. O percentual passou a ${dados.etapasConcluidas} de ${dados.totalEtapas}. A próxima etapa está destacada.`,
      tom: "green"
    });
  }

  async function abrirAjuste() {
    if (!sessao) return;
    setAlerta(null);
    const { ok, dados } = await chamarApi<{ textoObjetivo?: string } & ErroApi>(
      `/solicitacoes-trilha/${params.id}`,
      { token: sessao.accessToken }
    );
    if (!ok) {
      setAlerta({ texto: mensagemErro(dados, "Não foi possível abrir o ajuste. A trilha não foi alterada."), tom: "red" });
      return;
    }
    setPromptAjuste(dados.textoObjetivo ?? "");
    setAjusteAberto(true);
  }

  async function disponibilizar() {
    if (!sessao || !detalhe) return;
    setDisponibilizando(true);
    setAlerta(null);
    const { ok, dados } = await chamarApi<ProgressoDetalhe & ErroApi>(
      `/solicitacoes-trilha/trilha/${detalhe.trilha.id}/disponibilidade`,
      {
        method: "PATCH",
        token: sessao.accessToken,
        body: JSON.stringify({ disponivel: !detalhe.trilha.disponivel })
      }
    );
    setDisponibilizando(false);
    if (!ok || !("id" in dados) || !dados.id) {
      setAlerta({ texto: mensagemErro(dados, "Não foi possível alterar a disponibilidade. A trilha permanece como estava."), tom: "red" });
      return;
    }
    setDetalhe(dados);
    setAlerta({
      texto: dados.trilha.disponivel
        ? "Esta trilha está disponível para todos. O seu progresso continua o mesmo."
        : "A trilha saiu do catálogo. Quem já começou continua de onde parou.",
      tom: "green"
    });
  }

  async function ajustar(e: FormEvent) {
    e.preventDefault();
    if (!sessao) return;
    setAjustando(true);
    setAlerta({
      texto: "Atualizando a trilha… Nada foi alterado ainda.",
      tom: "amber"
    });
    const { ok, dados } = await chamarApi<ProgressoDetalhe & ErroApi>(`/solicitacoes-trilha/${params.id}`, {
      method: "POST",
      token: sessao.accessToken,
      body: JSON.stringify({ textoObjetivo: promptAjuste })
    });
    setAjustando(false);
    if (!ok || !("id" in dados) || !dados.id) {
      setAlerta({
        texto: mensagemErro(dados, "Não foi possível ajustar a trilha. A versão anterior permanece."),
        tom: "red"
      });
      return;
    }
    setDetalhe(dados);
    setAjusteAberto(false);
    setAlerta({
      texto: "Trilha atualizada. As etapas que permaneceram conservam a conclusão. As novas ainda não estão concluídas.",
      tom: "green"
    });
  }

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
      <p className="text-sm text-slate-500">
        <Link className="text-brand-trail underline" href="/catalogo">
          ← Catálogo
        </Link>
      </p>
      {alerta ? (
        <div className="mt-4">
          <Alerta texto={alerta.texto} tom={alerta.tom} />
        </div>
      ) : null}
      {detalhe ? (
        <>
          <h2 className="mt-2 text-2xl font-semibold leading-snug">{detalhe.trilha.titulo}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {detalhe.trilha.categoria.nome} · trilha {detalhe.trilha.tipo}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{detalhe.trilha.descricao}</p>
          {detalhe.trilha.tipo === "personalizada" && detalhe.trilha.souAutor ? (
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              {detalhe.trilha.disponivel
                ? "Qualquer aluno encontra esta trilha e cursa o mesmo percurso. O progresso de cada um fica separado."
                : "Enquanto estiver disponível, qualquer aluno encontra esta trilha e cursa o mesmo percurso. O progresso de cada um fica separado."}
            </p>
          ) : null}
          {detalhe.trilha.autorNome && !detalhe.trilha.souAutor ? (
            <p className="mt-2 text-sm text-slate-500">Por {detalhe.trilha.autorNome}</p>
          ) : null}
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <BarraProgresso feitos={detalhe.etapasConcluidas} total={detalhe.totalEtapas} />
          </div>
          {detalhe.ativo ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setConversaAberta(true)}
                className="inline-flex items-center justify-center rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark"
              >
                Conversar sobre esta trilha
              </button>
              {detalhe.trilha.tipo === "personalizada" && detalhe.trilha.souAutor ? (
                <>
                  <button
                    type="button"
                    onClick={() => void abrirAjuste()}
                    className="inline-flex items-center justify-center rounded-md border border-brand-trail px-3 py-2 text-sm font-medium text-brand-trail hover:bg-brand-mint"
                  >
                    Ajustar trilha
                  </button>
                  <button
                    type="button"
                    disabled={disponibilizando}
                    onClick={() => void disponibilizar()}
                    className="inline-flex items-center justify-center rounded-md border border-brand-trail px-3 py-2 text-sm font-medium text-brand-trail hover:bg-brand-mint disabled:opacity-60"
                  >
                    {detalhe.trilha.disponivel ? "Retirar a disponibilidade" : "Disponível para todos"}
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
          {ajusteAberto ? (
            <form className="mt-4 rounded-lg border border-slate-200 bg-white p-4" onSubmit={(e) => void ajustar(e)}>
              <h3 className="text-lg font-semibold">Ajustar trilha</h3>
              <p className="mt-1 text-sm text-slate-600">
                Reescreva o pedido. O agente devolve a trilha inteira e grava nesta mesma trilha.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Etapas atuais</p>
              <ol className="mt-2 space-y-1 text-sm">
                {detalhe.trilha.etapas.map((etapa) => (
                  <li key={etapa.id}>
                    {etapa.ordem}. {etapa.titulo}
                    {etapa.concluida ? <span className="text-brand-trail"> · concluída</span> : null}
                  </li>
                ))}
              </ol>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Prompt
                <textarea
                  name="textoObjetivo"
                  rows={5}
                  required
                  disabled={ajustando}
                  value={promptAjuste}
                  onChange={(ev) => setPromptAjuste(ev.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2 disabled:bg-slate-50"
                />
              </label>
              <p className="mt-2 text-xs text-slate-500">Pode levar até um minuto. Até a resposta completa, nada é alterado.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={ajustando}
                  className="inline-flex rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60"
                >
                  {ajustando ? "Atualizando…" : "Atualizar trilha"}
                </button>
                <button
                  type="button"
                  disabled={ajustando}
                  onClick={() => setAjusteAberto(false)}
                  className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : null}
          <div className="mt-6 space-y-3">
            {detalhe.trilha.etapas.map((etapa) => {
              const atual = detalhe.proximaEtapa?.id === etapa.id;
              const aberta = abertas[etapa.id] === true;
              const partes = partirConteudo(etapa.conteudo);
              return (
                <article
                  key={etapa.id}
                  className={`rounded-lg border border-slate-200 bg-white ${atual ? "ring-2 ring-brand-trail" : ""}`}
                >
                  <button
                    type="button"
                    aria-expanded={aberta}
                    onClick={() => setAbertas((atualMapa) => ({ ...atualMapa, [etapa.id]: !aberta }))}
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span>
                      <span className="text-xs font-medium uppercase tracking-wide text-brand-trail">
                        Etapa {etapa.ordem}
                      </span>
                      <span className="mt-1 block text-base font-semibold text-brand-ink">{etapa.titulo}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {selo(etapa, atual)}
                      <span className="text-sm text-slate-500" aria-hidden="true">
                        {aberta ? "–" : "+"}
                      </span>
                    </span>
                  </button>
                  {aberta ? (
                    <div className="border-t border-slate-100 px-4 py-3">
                      {partes.corpo ? <MarkdownEtapa texto={partes.corpo} /> : null}
                      {partes.exercicio ? (
                        <div className="mt-4 rounded-md bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-brand-ink">Exercício</p>
                          <div className="mt-2">
                            <MarkdownEtapa texto={partes.exercicio} />
                          </div>
                          {partes.resposta ? (
                            <button
                              type="button"
                              onClick={() =>
                                setResposta({ titulo: etapa.titulo, texto: partes.resposta ?? "" })
                              }
                              className="mt-3 inline-flex rounded-md border border-brand-trail bg-white px-3 py-2 text-sm font-medium text-brand-trail hover:bg-brand-mint"
                            >
                              Ver resposta
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                      {atual ? (
                        <button
                          type="button"
                          disabled={marcando}
                          onClick={() => void concluir(etapa.id, etapa.titulo)}
                          className="mt-3 inline-flex rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60"
                        >
                          {marcando ? "Registrando…" : "Marcar como concluída"}
                        </button>
                      ) : null}
                      {etapa.concluida ? (
                        <p className="mt-3 text-xs text-slate-500">
                          Já marcada. Marcar de novo não duplica o registro.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
          {resposta ? (
            <Lightbox titulo={`Resposta · ${resposta.titulo}`} onFechar={() => setResposta(null)}>
              <MarkdownEtapa texto={resposta.texto} />
            </Lightbox>
          ) : null}
          {conversaAberta && sessao ? (
            <Lightbox titulo="Conversar sobre esta trilha" largo onFechar={() => setConversaAberta(false)}>
              <ConversaPainel progressoId={detalhe.id} token={sessao.accessToken} />
            </Lightbox>
          ) : null}
          <section className="mt-8">
            <h3 className="text-lg font-semibold">Histórico</h3>
            <p className="text-sm text-slate-600">
              Etapas que você já concluiu nesta trilha.
            </p>
            {detalhe.historico.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Nenhuma conclusão ainda. Só entram no percentual as etapas que você marcar.
              </p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {detalhe.historico.map((item) => (
                  <li key={item.etapaId}>
                    {dataPt(item.dataConclusao)} — {item.titulo}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="mt-6 text-xs text-slate-500">
            Escolher de novo esta trilha retoma o mesmo acompanhamento. A conversa com o agente só está disponível enquanto você acompanha esta trilha.
          </p>
        </>
      ) : null}
    </AppShell>
  );
}
