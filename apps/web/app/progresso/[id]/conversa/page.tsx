"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { CascaPublica } from "@/components/casca-publica";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { ConversaDetalhe, MensagemConversa } from "@/lib/progresso";
import { lerSessao, Sessao } from "@/lib/sessao";

function horaPt(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function Bolha({ mensagem }: { mensagem: MensagemConversa }) {
  const aluno = mensagem.origem === "aluno";
  return (
    <article className={`flex ${aluno ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg border px-3 py-2 ${
          aluno ? "border-brand-trail bg-brand-mint text-brand-ink" : "border-slate-200 bg-white text-slate-800"
        }`}
      >
        <p
          className={`text-[0.65rem] font-medium uppercase tracking-wide ${
            aluno ? "text-brand-trail" : "text-slate-500"
          }`}
        >
          {mensagem.origem} · {horaPt(mensagem.dataEnvio)}
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{mensagem.texto}</p>
      </div>
    </article>
  );
}

export default function ConversaPage() {
  const params = useParams<{ id: string }>();
  const [sessao, setSessao] = useState<Sessao | null | undefined>(undefined);
  const [conversa, setConversa] = useState<ConversaDetalhe | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [recusa, setRecusa] = useState<"sem_progresso" | null>(null);
  const [alerta, setAlerta] = useState<{ texto: string; tom: "red" | "amber" | "green" } | null>(null);

  useEffect(() => {
    setSessao(lerSessao());
  }, []);

  useEffect(() => {
    if (sessao === undefined) return;
    if (!sessao || sessao.perfil !== "aluno") return;
    void carregar(sessao.accessToken);
  }, [sessao, params.id]);

  async function carregar(token: string) {
    const { ok, dados } = await chamarApi<ConversaDetalhe & ErroApi>(`/progresso/${params.id}/mensagens`, { token });
    if (!ok) {
      if (dados.codigo === "sem_progresso") {
        setRecusa("sem_progresso");
        setConversa(null);
        return;
      }
      setAlerta({ texto: mensagemErro(dados, "Não foi possível abrir a conversa."), tom: "red" });
      return;
    }
    setRecusa(null);
    setConversa(dados);
    if (!dados.llmHabilitado) {
      setAlerta({
        texto:
          "O agente está desligado. Nenhuma mensagem nova foi gravada. Continue pelo acompanhamento da trilha.",
        tom: "red"
      });
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!sessao || sessao.perfil !== "aluno") return;
    setEnviando(true);
    setAlerta({
      texto:
        "Aguardando o agente… Isso pode levar até um minuto. O catálogo e as etapas não foram alterados.",
      tom: "amber"
    });
    const { ok, dados } = await chamarApi<ConversaDetalhe & ErroApi>(`/progresso/${params.id}/mensagens`, {
      method: "POST",
      token: sessao.accessToken,
      body: JSON.stringify({ texto })
    });
    setEnviando(false);
    if (!ok) {
      if (dados.codigo === "sem_progresso") {
        setRecusa("sem_progresso");
        setConversa(null);
        return;
      }
      setAlerta({
        texto: mensagemErro(
          dados,
          "Não foi possível enviar a mensagem. O catálogo não foi alterado."
        ),
        tom: "red"
      });
      await carregar(sessao.accessToken);
      return;
    }
    setConversa(dados);
    setTexto("");
    setAlerta(null);
  }

  if (sessao === undefined) return null;

  if (!sessao) {
    return (
      <CascaPublica>
        <h2 className="text-2xl font-semibold">Conversa</h2>
        <div className="mt-4">
          <Alerta texto="Para conversar com o agente, entre como aluno e tenha uma trilha em andamento. Você ainda pode ver o catálogo sem conta." />
        </div>
        <p className="mt-3 text-sm">
          <Link className="text-brand-trail underline" href={`/login?next=/progresso/${params.id}/conversa`}>
            Ir para o login
          </Link>
        </p>
        <p className="mt-4 text-sm">
          <Link className="text-slate-600 underline" href="/catalogo">
            Ver catálogo sem conta
          </Link>
        </p>
      </CascaPublica>
    );
  }

  if (sessao.perfil === "administrador") {
    return (
      <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
        <h2 className="text-2xl font-semibold">Conversa</h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
          A conversa sobre a trilha é do aluno. Aqui você só liga ou desliga o agente.
        </p>
        <div className="mt-4">
          <Alerta texto="Operação recusada para este perfil. Nenhuma mensagem foi gravada." />
        </div>
        <p className="mt-4 text-sm">
          <Link className="text-brand-trail underline" href="/agente">
            Ir ao interruptor do agente
          </Link>
        </p>
      </AppShell>
    );
  }

  if (recusa === "sem_progresso") {
    return (
      <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
        <h2 className="text-2xl font-semibold">Conversa</h2>
        <div className="mt-4">
          <Alerta texto="Sem uma trilha em andamento, a conversa não começa. Nenhuma mensagem foi gravada." />
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
          Comece ou retome um acompanhamento. A conversa fica ligada a essa trilha.
        </p>
        <p className="mt-3 text-sm">
          <Link className="text-brand-trail underline" href="/catalogo">
            Ir ao catálogo
          </Link>
        </p>
        <p className="mt-2 text-sm">
          <Link className="text-slate-600 underline" href="/progresso">
            Meu progresso
          </Link>
        </p>
      </AppShell>
    );
  }

  const llmOff = conversa ? !conversa.llmHabilitado : false;
  const formBloqueado = enviando || llmOff;

  return (
    <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
      {conversa ? (
        <>
          <p className="text-sm text-slate-500">
            <Link className="text-brand-trail underline" href={`/progresso/${conversa.progressoId}`}>
              ← {conversa.trilha.titulo}
            </Link>
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-snug">Conversa</h2>
          <p className="mt-1 text-sm text-slate-500">
            {conversa.trilha.categoria.nome} · trilha {conversa.trilha.tipo} · <strong>Progresso ativo</strong>
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            As mensagens desta conversa são sobre esta trilha. O agente não altera o catálogo.
          </p>
        </>
      ) : (
        <h2 className="text-2xl font-semibold leading-snug">Conversa</h2>
      )}
      {alerta ? (
        <div className="mt-4">
          <Alerta texto={alerta.texto} tom={alerta.tom} />
        </div>
      ) : null}
      {conversa ? (
        <>
          <div className="mt-6 space-y-3">
            {conversa.mensagens.map((m) => (
              <Bolha key={m.id} mensagem={m} />
            ))}
          </div>
          <form className="mt-4 space-y-3" onSubmit={(e) => void enviar(e)}>
            <label className="block text-sm font-medium leading-snug text-slate-700">
              Mensagem
              <textarea
                name="texto"
                rows={3}
                disabled={formBloqueado}
                value={texto}
                onChange={(ev) => setTexto(ev.target.value)}
                className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2 disabled:bg-slate-50"
              />
            </label>
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
              A resposta pode levar até um minuto. Nenhuma chave de serviço aparece nesta tela.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={formBloqueado || !texto.trim()}
                className="inline-flex w-full items-center justify-center rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60 sm:w-auto"
              >
                {enviando ? "Enviando…" : alerta?.texto.includes("60 segundos") && alerta.tom === "red" ? "Tentar de novo" : "Enviar"}
              </button>
              <Link
                href={`/progresso/${conversa.progressoId}`}
                className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                Voltar à trilha
              </Link>
            </div>
          </form>
          <p className="mt-6 text-xs text-slate-500">
            Para pedir uma trilha nova, use Trilha personalizada — não esta conversa.
          </p>
        </>
      ) : null}
    </AppShell>
  );
}
