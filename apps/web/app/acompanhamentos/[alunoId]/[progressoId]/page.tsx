"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { lerSessao, Sessao } from "@/lib/sessao";
import { AcompanhamentoDetalhe, percentualTexto } from "@/lib/usuarios";

export default function AcompanhamentoProgressoPage() {
  const router = useRouter();
  const params = useParams<{ alunoId: string; progressoId: string }>();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [detalhe, setDetalhe] = useState<AcompanhamentoDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);

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
    if (!sessao || !params.alunoId || !params.progressoId) return;
    void (async () => {
      const { ok, dados } = await chamarApi<AcompanhamentoDetalhe & ErroApi>(
        `/acompanhamentos/${params.alunoId}/progressos/${params.progressoId}`,
        { token: sessao.accessToken }
      );
      if (!ok) {
        setErro(mensagemErro(dados, "Não foi possível abrir esta trilha."));
        return;
      }
      setDetalhe(dados);
    })();
  }, [sessao, params.alunoId, params.progressoId]);

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      <p className="text-sm text-slate-500">
        <Link className="text-brand-trail underline" href={`/acompanhamentos/${params.alunoId}`}>
          ← Voltar ao aluno
        </Link>
      </p>
      {erro ? (
        <div className="mt-4">
          <Alerta texto={erro} />
        </div>
      ) : null}
      {detalhe ? (
        <>
          <h2 className="mt-2 text-2xl font-semibold">{detalhe.trilha.titulo}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {detalhe.trilha.tipo === "personalizada" ? "Personalizada" : "Pré-definida"} · {detalhe.trilha.categoria.nome}
          </p>
          <div className="mt-4 max-w-lg">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-brand-trail"
                style={{ width: percentualTexto(detalhe.percentualProgresso) }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">{percentualTexto(detalhe.percentualProgresso)}</p>
          </div>
          <ol className="mt-6 max-w-lg space-y-3">
            {detalhe.trilha.etapas.map((etapa) => {
              const proxima = detalhe.proximaEtapa?.id === etapa.id;
              return (
                <li key={etapa.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-medium text-brand-ink">
                    {etapa.ordem}. {etapa.titulo}
                  </p>
                  <p className={`text-xs ${etapa.concluida ? "text-brand-trail" : "text-slate-500"}`}>
                    {etapa.concluida ? "Concluída" : proxima ? "Pendente · próxima etapa" : "Pendente"}
                  </p>
                </li>
              );
            })}
          </ol>
        </>
      ) : null}
    </AppShell>
  );
}
