"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { UsuarioForm } from "@/components/usuario-form";
import { chamarApi, mensagemErro, ErroApi } from "@/lib/api";
import { lerSessao, Sessao } from "@/lib/sessao";
import { UsuarioConta } from "@/lib/usuarios";

export default function EditarContaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [usuario, setUsuario] = useState<UsuarioConta | null>(null);
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
      const { ok, dados } = await chamarApi<UsuarioConta & ErroApi>(`/usuarios/${params.id}`, {
        token: sessao.accessToken
      });
      if (!ok) {
        setErro(mensagemErro(dados, "Não foi possível abrir a conta."));
        return;
      }
      setUsuario(dados);
    })();
  }, [sessao, params.id]);

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      {erro ? <Alerta texto={erro} /> : null}
      {usuario ? <UsuarioForm token={sessao.accessToken} inicial={usuario} /> : null}
    </AppShell>
  );
}
