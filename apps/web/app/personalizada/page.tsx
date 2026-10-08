"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { CascaPublica } from "@/components/casca-publica";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { CatalogoPublico, ProgressoDetalhe } from "@/lib/progresso";
import { lerSessao, Sessao } from "@/lib/sessao";

const OBJETIVO_PADRAO =
  "Quero analisar planilhas de vendas com SQL e montar consultas simples para totais por mês.";

export default function PersonalizadaPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null | undefined>(undefined);
  const [catalogo, setCatalogo] = useState<CatalogoPublico | null>(null);
  const [objetivo, setObjetivo] = useState(OBJETIVO_PADRAO);
  const [enviando, setEnviando] = useState(false);
  const [alerta, setAlerta] = useState<{ texto: string; tom: "red" | "amber" | "green" } | null>(null);

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
    void (async () => {
      const { ok, dados } = await chamarApi<CatalogoPublico & ErroApi>("/catalogo");
      if (!ok) return;
      setCatalogo(dados);
      if (dados.indisponivel) {
        setAlerta({
          texto:
            "Por enquanto não há trilhas publicadas e o agente está desligado. Nenhuma trilha nova foi criada.",
          tom: "amber"
        });
      } else if (!dados.llmHabilitado) {
        setAlerta({
          texto:
            "O agente está desligado. Use o catálogo enquanto isso.",
          tom: "red"
        });
      }
    })();
  }, [sessao]);

  if (sessao === undefined) return null;

  async function gerar(e: FormEvent) {
    e.preventDefault();
    if (!sessao) {
      setAlerta({
        texto: "Para criar uma trilha personalizada, entre como aluno. Você ainda pode ver o catálogo sem conta.",
        tom: "red"
      });
      return;
    }
    setEnviando(true);
    setAlerta({
      texto:
        "Gerando a trilha… Isso pode levar até um minuto. Nada foi gravado ainda; o catálogo continua disponível.",
      tom: "amber"
    });
    const { ok, dados } = await chamarApi<ProgressoDetalhe & ErroApi>("/solicitacoes-trilha", {
      method: "POST",
      token: sessao.accessToken,
      body: JSON.stringify({ textoObjetivo: objetivo })
    });
    setEnviando(false);
    if (!ok || !("id" in dados) || !dados.id) {
      const codigo = dados.codigo;
      const tom = codigo === "catalogo_indisponivel" ? "amber" : "red";
      setAlerta({
        texto: mensagemErro(
          dados,
          "Não foi possível gerar a trilha personalizada. Nenhuma trilha foi criada."
        ),
        tom
      });
      return;
    }
    router.push(`/progresso/${dados.id}?criada=1`);
  }

  if (!sessao) {
    return (
      <CascaPublica>
        <h2 className="text-2xl font-semibold">Trilha personalizada</h2>
        <div className="mt-4">
          <Alerta texto="Para criar uma trilha personalizada, entre como aluno. Você ainda pode ver o catálogo sem conta." />
        </div>
        <p className="mt-3 text-sm">
          <Link className="text-brand-trail underline" href="/login?next=/personalizada">
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

  const llmOff = catalogo ? !catalogo.llmHabilitado : false;
  const e4 = catalogo?.indisponivel === true;
  const formBloqueado = enviando || llmOff || e4;

  return (
    <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
      <h2 className="text-2xl font-semibold">Trilha personalizada</h2>
      {!e4 && !enviando ? (
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
          Descreva o que você quer estudar. O agente monta um percurso e abre o acompanhamento.
        </p>
      ) : null}
      {enviando ? (
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
          Aguarde a resposta. Você pode abrir o catálogo enquanto isso.
        </p>
      ) : null}
      {alerta ? (
        <div className="mt-4">
          <Alerta texto={alerta.texto} tom={alerta.tom} />
        </div>
      ) : null}
      {e4 ? (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
          Quando houver trilhas publicadas ou o agente for ligado, esta tela deixa de aparecer vazia.
        </p>
      ) : (
        <form className="mt-6 max-w-2xl space-y-4" onSubmit={(e) => void gerar(e)}>
          <label className="block text-sm font-medium leading-snug text-slate-700">
            Objetivo de estudo
            <textarea
              name="textoObjetivo"
              rows={5}
              disabled={formBloqueado}
              value={objetivo}
              onChange={(ev) => setObjetivo(ev.target.value)}
              className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2 disabled:bg-slate-50"
            />
          </label>
          <p className="text-xs leading-relaxed text-slate-500">
            Esta trilha entra na categoria <strong>Personalizada</strong>. Você não precisa escolher categoria.
          </p>
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
            A geração pode levar até um minuto. O catálogo e o seu progresso já existentes continuam disponíveis.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={formBloqueado}
              className="inline-flex w-full items-center justify-center rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark disabled:opacity-60 sm:w-auto"
            >
              {enviando ? "Gerando…" : alerta?.tom === "red" ? "Tentar de novo" : "Gerar trilha"}
            </button>
            <Link
              href="/catalogo"
              className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              Ir ao catálogo
            </Link>
          </div>
        </form>
      )}
      {enviando ? (
        <p className="mt-4 text-sm">
          <Link className="text-brand-trail underline" href="/catalogo">
            Abrir o catálogo enquanto espera
          </Link>
        </p>
      ) : null}
      {llmOff && !e4 ? (
        <p className="mt-4 text-sm">
          <Link className="text-brand-trail underline" href="/catalogo">
            Ir ao catálogo
          </Link>
        </p>
      ) : null}
      <p className="mt-6 text-xs text-slate-500">
        Para tirar dúvidas sobre uma trilha, use a conversa no acompanhamento. As trilhas do catálogo não mudam.
      </p>
    </AppShell>
  );
}
