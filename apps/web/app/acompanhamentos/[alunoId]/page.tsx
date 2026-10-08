"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { lerSessao, Sessao } from "@/lib/sessao";
import { AcompanhamentoAluno, percentualTexto } from "@/lib/usuarios";

export default function AcompanhamentoAlunoPage() {
  const router = useRouter();
  const params = useParams<{ alunoId: string }>();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [aluno, setAluno] = useState<AcompanhamentoAluno | null>(null);
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
    if (!sessao || !params.alunoId) return;
    void (async () => {
      const { ok, dados } = await chamarApi<AcompanhamentoAluno & ErroApi>(
        `/acompanhamentos/${params.alunoId}`,
        { token: sessao.accessToken }
      );
      if (!ok) {
        setErro(mensagemErro(dados, "Não foi possível abrir o andamento."));
        return;
      }
      setAluno(dados);
    })();
  }, [sessao, params.alunoId]);

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      <p className="text-sm text-slate-500">
        <Link className="text-brand-trail underline" href="/acompanhamentos">
          ← Andamento
        </Link>
      </p>
      {erro ? (
        <div className="mt-4">
          <Alerta texto={erro} />
        </div>
      ) : null}
      {aluno ? (
        <>
          <h2 className="mt-2 text-2xl font-semibold">{aluno.nome}</h2>
          <p className="mt-1 text-sm text-slate-600">{aluno.email} · aluno</p>
          {aluno.progressos.length === 0 ? (
            <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Este aluno ainda não acompanha nenhuma trilha. Nada foi iniciado por aqui.
            </p>
          ) : (
            <div className="mt-6 grid gap-4">
              {aluno.progressos.map((p) => (
                <Link
                  key={p.id}
                  href={`/acompanhamentos/${aluno.id}/${p.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-trail"
                >
                  <p className="text-sm font-medium text-brand-ink">{p.trilha.titulo}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.trilha.tipo === "personalizada" ? "Personalizada" : "Pré-definida"} · {p.trilha.categoria.nome}{" "}
                    · {p.etapasConcluidas} de {p.totalEtapas} etapas
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-brand-trail"
                      style={{ width: percentualTexto(p.percentualProgresso) }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{percentualTexto(p.percentualProgresso)}</p>
                </Link>
              ))}
            </div>
          )}
          <p className="mt-6 text-xs text-slate-500">
            O percentual é calculado pelas etapas que o aluno marcou. Você não conclui etapas por ele.
          </p>
        </>
      ) : null}
    </AppShell>
  );
}
