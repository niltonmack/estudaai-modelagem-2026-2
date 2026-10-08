"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { BarraTrilha, ColunasSemana, Rosca } from "@/components/graficos";
import { Destaque, EsqueletoResumo, Numero } from "@/components/resumo";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { percentual, resumirInicio } from "@/lib/inicio";
import { ProgressoDetalhe, ProgressoLista } from "@/lib/progresso";
import { lerSessao, Sessao } from "@/lib/sessao";

function Atalhos() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <Link href="/catalogo" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-trail">
        <p className="font-semibold text-brand-ink">Explorar o catálogo</p>
        <p className="mt-1 text-sm text-slate-500">Trilhas pré-definidas por categoria.</p>
      </Link>
      <Link href="/personalizada" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-trail">
        <p className="font-semibold text-brand-ink">Trilha personalizada</p>
        <p className="mt-1 text-sm text-slate-500">Descreva um objetivo; o agente monta um percurso para você.</p>
      </Link>
    </div>
  );
}

export default function InicioPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [detalhes, setDetalhes] = useState<ProgressoDetalhe[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const atual = lerSessao();
    if (!atual) {
      router.replace("/login");
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
      const lista = await chamarApi<ProgressoLista[] & ErroApi>("/progresso", { token: sessao.accessToken });
      if (!lista.ok || !Array.isArray(lista.dados)) {
        setErro(mensagemErro(lista.dados, "Não foi possível carregar seu avanço. Tente de novo em instantes."));
        setCarregando(false);
        return;
      }
      const respostas = await Promise.all(
        lista.dados.map((item) =>
          chamarApi<ProgressoDetalhe & ErroApi>(`/progresso/${item.id}`, { token: sessao.accessToken })
        )
      );
      if (respostas.some((r) => !r.ok)) {
        setErro("Não foi possível carregar seu avanço. Tente de novo em instantes. Suas conclusões não foram alteradas.");
      }
      setDetalhes(respostas.filter((r) => r.ok).map((r) => r.dados));
      setCarregando(false);
    })();
  }, [sessao]);

  const resumo = useMemo(() => resumirInicio(detalhes), [detalhes]);

  if (!sessao) return null;
  const primeiroNome = sessao.nome.split(" ")[0];

  if (carregando) {
    return (
      <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
        <EsqueletoResumo texto="Carregando seu avanço…" />
      </AppShell>
    );
  }

  if (detalhes.length === 0) {
    return (
      <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
        {erro ? (
          <div className="mb-4">
            <Alerta texto={erro} />
          </div>
        ) : null}
        <Destaque
          nome={primeiroNome}
          titulo="Comece sua primeira trilha"
          texto="Escolha uma trilha no catálogo ou descreva um objetivo para o agente. Os gráficos de avanço aparecem quando você marcar a primeira etapa."
          href="/catalogo"
          acao="Ver o catálogo"
        />
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="flex justify-center">
            <Rosca percentual={0} tamanho={120} />
          </div>
          <p className="mt-3 text-sm text-slate-600">Nenhum acompanhamento ainda.</p>
        </div>
        <Atalhos />
      </AppShell>
    );
  }

  const continuar = resumo.continuar;
  const semanaAtual = resumo.semanas[resumo.semanas.length - 1]?.quantidade ?? 0;

  return (
    <AppShell nome={sessao.nome} papel="Aluno" token={sessao.accessToken}>
      {erro ? (
        <div className="mb-4">
          <Alerta texto={erro} />
        </div>
      ) : null}
      {continuar && continuar.proximaEtapa ? (
        <Destaque
          nome={primeiroNome}
          titulo={`Continue em ${continuar.trilha.titulo}`}
          texto={
            <>
              Próxima etapa: <strong>{continuar.proximaEtapa.titulo}</strong>. Você já concluiu{" "}
              {continuar.etapasConcluidas} de {continuar.totalEtapas}.
            </>
          }
          href={`/progresso/${continuar.id}`}
          acao="Continuar de onde parei"
        />
      ) : (
        <Destaque
          nome={primeiroNome}
          titulo="Todas as etapas concluídas"
          texto="Você terminou todas as trilhas que acompanha. Escolha outra no catálogo para seguir estudando."
          href="/catalogo"
          acao="Ver o catálogo"
        />
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Numero rotulo="Em andamento" valor={resumo.emAndamento} detalhe="trilhas" />
        <Numero rotulo="Etapas concluídas" valor={resumo.feitas} detalhe={`de ${resumo.total}`} />
        <Numero rotulo="Nesta semana" valor={semanaAtual} detalhe="etapas marcadas" />
        <Numero rotulo="Trilhas finalizadas" valor={resumo.finalizadas} detalhe="100% das etapas" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-brand-ink">Avanço geral</h3>
          <p className="text-xs text-slate-500">Todas as trilhas que você acompanha</p>
          <div className="mt-3 flex justify-center">
            <Rosca percentual={resumo.percentual} />
          </div>
          <p className="mt-2 text-center text-sm text-slate-600">
            {resumo.feitas} de {resumo.total} etapas
          </p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h3 className="font-semibold text-brand-ink">Ritmo das últimas 8 semanas</h3>
          <p className="text-xs text-slate-500">Etapas marcadas como concluídas em cada semana</p>
          <div className="mt-4">
            <ColunasSemana semanas={resumo.semanas} />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-brand-ink">Avanço por trilha</h3>
          <Link href="/progresso" className="text-sm text-brand-trail underline">
            Meu progresso
          </Link>
        </div>
        <ul className="mt-4 space-y-4">
          {detalhes.map((d) => {
            const finalizada = d.totalEtapas > 0 && d.etapasConcluidas === d.totalEtapas;
            const pct = percentual(d.etapasConcluidas, d.totalEtapas);
            return (
              <li key={d.id}>
                <Link href={`/progresso/${d.id}`} className="block rounded-md hover:bg-slate-50">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-brand-ink">{d.trilha.titulo}</p>
                      <p className="truncate text-xs text-slate-500">
                        {d.trilha.categoria.nome} ·{" "}
                        {finalizada || !d.proximaEtapa ? "todas as etapas concluídas" : `próxima: ${d.proximaEtapa.titulo}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-brand-ink">{pct}%</span>
                  </div>
                  <BarraTrilha percentual={pct} />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Atalhos />
    </AppShell>
  );
}
