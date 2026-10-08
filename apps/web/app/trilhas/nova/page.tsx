"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { TrilhaForm } from "@/components/trilha-form";
import { lerSessao, Sessao } from "@/lib/sessao";

export default function NovaTrilhaPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);

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

  if (!sessao) return null;

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      <TrilhaForm token={sessao.accessToken} />
    </AppShell>
  );
}
