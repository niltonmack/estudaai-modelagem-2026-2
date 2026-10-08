"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { lerSessao, Sessao } from "@/lib/sessao";
import { AcompanhamentoAluno, percentualTexto } from "@/lib/usuarios";

export default function AcompanhamentosPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [lista, setLista] = useState<AcompanhamentoAluno[]>([]);
  const [alerta, setAlerta] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

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
    if (!sessao) return;
    void (async () => {
      const { ok, dados } = await chamarApi<AcompanhamentoAluno[] & ErroApi>("/acompanhamentos", {
        token: sessao.accessToken
      });
      if (!ok) {
        setAlerta(mensagemErro(dados, "Não foi possível listar o andamento."));
        setLista([]);
      } else {
        setLista(Array.isArray(dados) ? dados : []);
      }
      setCarregando(false);
    })();
  }, [sessao]);

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      <h2 className="text-2xl font-semibold">Andamento dos alunos</h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
        Quem está estudando o quê, e quanto já concluiu. Esta tela não marca etapas nem abre conversa.
      </p>
      {alerta ? (
        <div className="mt-4">
          <Alerta texto={alerta} />
        </div>
      ) : null}
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {carregando ? (
          <p className="px-4 py-6 text-sm text-slate-500">Carregando andamento…</p>
        ) : (
          <table className="w-full min-w-0 text-left text-sm max-sm:block">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 max-sm:hidden">
              <tr>
                <th className="px-4 py-2 font-medium">Aluno</th>
                <th className="px-4 py-2 font-medium">Trilhas</th>
                <th className="px-4 py-2 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 max-sm:block">
              {lista.map((aluno) => (
                <tr
                  key={aluno.id}
                  className="max-sm:mb-3 max-sm:block max-sm:w-full max-sm:rounded-lg max-sm:border max-sm:border-slate-200 max-sm:p-3"
                >
                  <td className="px-4 py-3 font-medium text-brand-ink max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    {aluno.nome}
                    <span className="mt-0.5 block font-normal text-slate-500">{aluno.email}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    {aluno.progressos.length === 0
                      ? "Nenhuma trilha em andamento"
                      : aluno.progressos.map((p) => (
                          <span key={p.id} className="block">
                            {p.trilha.titulo} · {percentualTexto(p.percentualProgresso)}
                          </span>
                        ))}
                  </td>
                  <td className="px-4 py-3 max-sm:block max-sm:w-full max-sm:px-0 max-sm:py-0.5">
                    <Link className="text-brand-trail underline" href={`/acompanhamentos/${aluno.id}`}>
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
