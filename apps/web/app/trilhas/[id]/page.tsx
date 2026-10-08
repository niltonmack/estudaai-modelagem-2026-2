"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { TrilhaForm } from "@/components/trilha-form";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { lerSessao, Sessao } from "@/lib/sessao";
import { Trilha } from "@/lib/trilha";

export default function EditarTrilhaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [trilha, setTrilha] = useState<Trilha | null>(null);
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
    if (!sessao || !params.id) return;
    void (async () => {
      const { ok, dados } = await chamarApi<Trilha & ErroApi>(`/trilhas/${params.id}`, {
        token: sessao.accessToken
      });
      if (!ok) {
        setErro(mensagemErro(dados, "Trilha não encontrada."));
        return;
      }
      setTrilha(dados);
    })();
  }, [sessao, params.id]);

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      {erro ? <Alerta texto={erro} /> : null}
      {trilha ? <TrilhaForm token={sessao.accessToken} inicial={trilha} /> : null}
    </AppShell>
  );
}
