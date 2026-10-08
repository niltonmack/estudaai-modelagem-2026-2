"use client";

import { FormEvent, useEffect, useState } from "react";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { ConversaDetalhe, MensagemConversa } from "@/lib/progresso";

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

export function ConversaPainel({ progressoId, token }: { progressoId: string; token: string }) {
  const [conversa, setConversa] = useState<ConversaDetalhe | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [recusa, setRecusa] = useState(false);
  const [alerta, setAlerta] = useState<{ texto: string; tom: "red" | "amber" | "green" } | null>(null);

  useEffect(() => {
    void carregar(token);
  }, [progressoId, token]);

  async function carregar(acesso: string) {
    const { ok, dados } = await chamarApi<ConversaDetalhe & ErroApi>(`/progresso/${progressoId}/mensagens`, {
      token: acesso
    });
    if (!ok) {
      if (dados.codigo === "sem_progresso") {
        setRecusa(true);
        setConversa(null);
        return;
      }
      setAlerta({ texto: mensagemErro(dados, "Não foi possível abrir a conversa."), tom: "red" });
      return;
    }
    setRecusa(false);
    setConversa(dados);
    if (!dados.llmHabilitado) {
      setAlerta({
        texto: "O agente está desligado. Nenhuma mensagem nova foi gravada. Continue pelo acompanhamento da trilha.",
        tom: "red"
      });
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setAlerta({
      texto: "Aguardando o agente… Isso pode levar até um minuto. O catálogo e as etapas não foram alterados.",
      tom: "amber"
    });
    const { ok, dados } = await chamarApi<ConversaDetalhe & ErroApi>(`/progresso/${progressoId}/mensagens`, {
      method: "POST",
      token,
      body: JSON.stringify({ texto })
    });
    setEnviando(false);
    if (!ok) {
      if (dados.codigo === "sem_progresso") {
        setRecusa(true);
        setConversa(null);
        return;
      }
      setAlerta({
        texto: mensagemErro(dados, "Não foi possível enviar a mensagem. O catálogo não foi alterado."),
        tom: "red"
      });
      await carregar(token);
      return;
    }
    setConversa(dados);
    setTexto("");
    setAlerta(null);
  }

  if (recusa) {
    return (
      <Alerta texto="Sem uma trilha em andamento, a conversa não começa. Nenhuma mensagem foi gravada." />
    );
  }

  const llmOff = conversa ? !conversa.llmHabilitado : false;
  const formBloqueado = enviando || llmOff;

  return (
    <div>
      {conversa ? (
        <p className="text-sm leading-relaxed text-slate-600">
          Conversa sobre <strong>{conversa.trilha.titulo}</strong>. O agente não altera o catálogo.
        </p>
      ) : null}
      {alerta ? (
        <div className="mt-3">
          <Alerta texto={alerta.texto} tom={alerta.tom} />
        </div>
      ) : null}
      {conversa ? (
        <>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {conversa.mensagens.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma mensagem ainda. Escreva a primeira dúvida sobre esta trilha.</p>
            ) : (
              conversa.mensagens.map((m) => <Bolha key={m.id} mensagem={m} />)
            )}
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
            <button
              type="submit"
              disabled={formBloqueado || !texto.trim()}
              className="inline-flex items-center justify-center rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}
