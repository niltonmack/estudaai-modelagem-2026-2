"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { BarraProgresso } from "@/components/markdown-etapa";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { dataPt, ProgressoLista } from "@/lib/progresso";
import { lerSessao, Sessao } from "@/lib/sessao";

export default function MeuProgressoPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [lista, setLista] = useState<ProgressoLista[]>([]);
  const [alerta, setAlerta] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const atual = lerSessao();
    if (!atual) {
      router.replace("/login?next=/progresso");
      return;
    }
    if (atual.perfil !== "aluno") {
      router.replace("/painel");
      return;
    }
    setSessao(atual);
  }, [router]);

  useEffect(() => {
    if (!sessao) return;
    void (async () => {
      const { ok, dados } = await chamarApi<ProgressoLista[] & ErroApi>("/progresso", {
        token: sessao.accessToken
      });
      if (!ok) {
        setAlerta(mensagemErro(dados, "Não foi possível listar o progresso."));
        setLista([]);
      } else {
        setLista(Array.isArray(dados) ? dados : []);
      }
      setCarregando(false);
    })();
  }, [sessao]);

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
      <h2 className="text-2xl font-semibold">Meu progresso</h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
        Seu acompanhamento. O percentual só aumenta quando você marca uma etapa como concluída.
      </p>
      {alerta ? (
        <div className="mt-4">
          <Alerta texto={alerta} />
        </div>
      ) : null}
      <div className="mt-6 space-y-4">
        {carregando ? <p className="text-sm text-slate-500">Carregando acompanhamentos…</p> : null}
        {!carregando && lista.length === 0 ? (
          <p className="text-sm text-slate-600">
            Nenhum acompanhamento ainda.{" "}
            <Link className="text-brand-trail underline" href="/catalogo">
              Escolha uma trilha no catálogo
            </Link>
            .
          </p>
        ) : null}
        {lista.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-brand-ink">{item.trilha.titulo}</h3>
                <p className="text-sm text-slate-600">
                  {item.trilha.categoria.nome} · iniciado em {dataPt(item.dataInicio)}
                </p>
              </div>
              <Link
                href={`/progresso/${item.id}`}
                className="inline-flex shrink-0 rounded-md bg-brand-trail px-3 py-2 text-sm font-medium text-white hover:bg-brand-trailDark"
              >
                Abrir trilha
              </Link>
            </div>
            <div className="mt-4">
              <BarraProgresso feitos={item.etapasConcluidas} total={item.totalEtapas} />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {item.proximaEtapa ? `Próxima: ${item.proximaEtapa.titulo}.` : "Todas as etapas foram concluídas."}
            </p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
