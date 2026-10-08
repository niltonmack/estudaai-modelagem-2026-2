"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { CategoriaForm } from "@/components/categoria-form";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { Categoria } from "@/lib/catalogo";
import { lerSessao, Sessao } from "@/lib/sessao";

export default function EditarCategoriaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
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
      const { ok, dados } = await chamarApi<Categoria & ErroApi>(`/categorias/${params.id}`, {
        token: sessao.accessToken
      });
      if (!ok) {
        setErro(mensagemErro(dados, "Categoria não encontrada."));
        return;
      }
      setCategoria(dados);
    })();
  }, [sessao, params.id]);

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      {erro ? <Alerta texto={erro} /> : null}
      {categoria ? <CategoriaForm token={sessao.accessToken} inicial={categoria} /> : null}
    </AppShell>
  );
}
