"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { lerSessao, Sessao } from "@/lib/sessao";

export default function AgentePage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [habilitado, setHabilitado] = useState(false);
  const [alerta, setAlerta] = useState<{ texto: string; tom: "red" | "green" } | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const atual = lerSessao();
    if (!atual) {
      router.replace("/login?next=/agente");
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
    const { ok, dados } = await chamarApi<{ habilitado: boolean } & ErroApi>("/configuracao/llm", { token });
    if (!ok) {
      setAlerta({ texto: mensagemErro(dados, "Não foi possível ler o interruptor."), tom: "red" });
      return;
    }
    setHabilitado(Boolean(dados.habilitado));
  }

  async function alternar() {
    if (!sessao) return;
    setSalvando(true);
    setAlerta(null);
    const proximo = !habilitado;
    const { ok, dados } = await chamarApi<ErroApi>("/configuracao/llm", {
      method: "POST",
      token: sessao.accessToken,
      body: JSON.stringify({ habilitado: proximo })
    });
    setSalvando(false);
    if (!ok) {
      setAlerta({ texto: mensagemErro(dados, "Não foi possível alterar o interruptor."), tom: "red" });
      return;
    }
    setHabilitado(proximo);
    setAlerta({
      texto: proximo
        ? "O agente passou a atender pedidos de trilha personalizada."
        : "Novos pedidos de trilha personalizada serão recusados. O catálogo continua disponível.",
      tom: proximo ? "green" : "red"
    });
  }

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      <h2 className="text-2xl font-semibold">Agente LLM</h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
        Só a administradora liga ou desliga o agente. O aluno não vê esta tela.
      </p>
      <div className="mt-6 max-w-xl rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-ink">Geração de trilha personalizada</p>
            <p className="mt-1 text-xs text-slate-500">Quando ligado, a resposta pode levar até um minuto.</p>
          </div>
          {habilitado ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-spark/20 px-2 py-0.5 text-xs font-medium text-brand-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-spark" aria-hidden="true" />
              Agente ligado
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              Agente desligado
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={habilitado}
            disabled={salvando}
            onClick={() => void alternar()}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ${
              habilitado ? "bg-brand-trail" : "bg-slate-300"
            } disabled:opacity-60`}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow"
              style={{ marginLeft: habilitado ? "1.25rem" : "0.125rem" }}
            />
          </button>
          <span className="text-sm text-slate-700">{habilitado ? "Habilitado" : "Desabilitado"}</span>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          A chave do serviço não aparece nesta tela.
        </p>
      </div>
      {alerta ? (
        <div className="mt-4 max-w-xl">
          <Alerta texto={alerta.texto} tom={alerta.tom} />
        </div>
      ) : null}
      <p className="mt-6 text-xs text-slate-500">
        Esta área não gera trilha nem acompanha estudo — isso é do aluno.
      </p>
    </AppShell>
  );
}
