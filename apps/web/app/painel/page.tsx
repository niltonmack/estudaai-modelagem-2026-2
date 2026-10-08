"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Alerta } from "@/components/auth-ui";
import { BarraTrilha, ColunasSemana, Rosca } from "@/components/graficos";
import { Destaque, EsqueletoResumo, Numero } from "@/components/resumo";
import { chamarApi, ErroApi } from "@/lib/api";
import { plural, resumirPainel } from "@/lib/painel";
import { lerSessao, Sessao } from "@/lib/sessao";
import { Trilha } from "@/lib/trilha";
import { AcompanhamentoAluno, UsuarioConta } from "@/lib/usuarios";

const ATALHOS = [
  { href: "/categorias", titulo: "Categorias", texto: "Organizar o catálogo por área de estudo." },
  { href: "/trilhas", titulo: "Trilhas e etapas", texto: "Publicar percursos com etapas em ordem." },
  { href: "/usuarios", titulo: "Usuários", texto: "Cadastrar, alterar e remover alunos e administradores." },
  { href: "/acompanhamentos", titulo: "Andamento dos alunos", texto: "Ver quais trilhas cada aluno faz e o percentual." },
  { href: "/agente", titulo: "Agente LLM", texto: "Ligar ou desligar a geração de trilhas personalizadas." }
];

function Atalhos() {
  return (
    <>
      <h3 className="mt-8 font-semibold text-brand-ink">Gestão</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ATALHOS.map((a) => (
          <Link key={a.href} href={a.href} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-trail">
            <p className="font-semibold text-brand-ink">{a.titulo}</p>
            <p className="mt-1 text-sm text-slate-500">{a.texto}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function PainelPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [andamento, setAndamento] = useState<AcompanhamentoAluno[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioConta[]>([]);
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [llmLigado, setLlmLigado] = useState<boolean | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

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
    const token = sessao.accessToken;
    void (async () => {
      const [a, u, t, l] = await Promise.all([
        chamarApi<AcompanhamentoAluno[] & ErroApi>("/acompanhamentos", { token }),
        chamarApi<UsuarioConta[] & ErroApi>("/usuarios", { token }),
        chamarApi<Trilha[] & ErroApi>("/trilhas", { token }),
        chamarApi<{ habilitado: boolean } & ErroApi>("/configuracao/llm", { token })
      ]);
      setErro(![a, u, t, l].every((r) => r.ok));
      setAndamento(a.ok && Array.isArray(a.dados) ? a.dados : []);
      setUsuarios(u.ok && Array.isArray(u.dados) ? u.dados : []);
      setTrilhas(t.ok && Array.isArray(t.dados) ? t.dados : []);
      setLlmLigado(l.ok ? l.dados.habilitado : null);
      setCarregando(false);
    })();
  }, [sessao]);

  const resumo = useMemo(() => resumirPainel(andamento, usuarios, trilhas), [andamento, usuarios, trilhas]);

  if (!sessao) return null;
  const primeiroNome = sessao.nome.split(" ")[0];

  if (carregando) {
    return (
      <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
        <EsqueletoResumo texto="Carregando o painel…" />
      </AppShell>
    );
  }

  const numeros = (
    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Numero rotulo="Alunos" valor={resumo.alunos} detalhe={plural(resumo.administradores, "administrador", "administradores")} />
      <Numero rotulo="Em andamento" valor={resumo.emAndamento} detalhe={`de ${plural(resumo.acompanhamentos, "acompanhamento", "acompanhamentos")}`} />
      <Numero rotulo="Trilhas publicadas" valor={resumo.trilhasPublicadas} detalhe={`de ${resumo.trilhasPreDefinidas} pré-definidas`} />
      <Numero
        rotulo="Agente LLM"
        valor={llmLigado === null ? "—" : llmLigado ? "Ligado" : "Desligado"}
        detalhe="trilhas personalizadas"
        destaque={llmLigado === true}
      />
    </div>
  );

  const aviso = erro ? (
    <div className="mb-4">
      <Alerta texto="Não foi possível carregar todos os números do painel. Tente de novo em instantes. Nada foi alterado." />
    </div>
  ) : null;

  if (resumo.acompanhamentos === 0) {
    return (
      <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
        {aviso}
        <Destaque
          nome={primeiroNome}
          titulo="Nenhum aluno começou uma trilha ainda"
          texto="Os gráficos aparecem quando um aluno escolher uma trilha. Confira se há trilhas publicadas no catálogo."
          href="/trilhas"
          acao="Ver trilhas"
        />
        {numeros}
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

  return (
    <AppShell nome={sessao.nome} papel="Administrador" token={sessao.accessToken}>
      {aviso}
      <Destaque
        nome={primeiroNome}
        titulo={`${plural(resumo.alunosComTrilha, "aluno acompanha", "alunos acompanham")} ${plural(
          resumo.trilhasAcompanhadas,
          "trilha",
          "trilhas"
        )}`}
        texto={`${plural(resumo.acompanhamentos, "acompanhamento", "acompanhamentos")} no total; ${resumo.emAndamento} ainda ${
          resumo.emAndamento === 1 ? "tem" : "têm"
        } etapas pendentes. O avanço geral está em ${resumo.percentual}%.`}
        href="/acompanhamentos"
        acao="Ver andamento dos alunos"
      />
      {numeros}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-brand-ink">Avanço geral dos alunos</h3>
          <p className="text-xs text-slate-500">Todos os acompanhamentos</p>
          <div className="mt-3 flex justify-center">
            <Rosca percentual={resumo.percentual} />
          </div>
          <p className="mt-2 text-center text-sm text-slate-600">
            {resumo.feitas} de {resumo.total} etapas
          </p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h3 className="font-semibold text-brand-ink">Novos acompanhamentos por semana</h3>
          <p className="text-xs text-slate-500">Trilhas iniciadas pelos alunos nas últimas 8 semanas</p>
          <div className="mt-4">
            <ColunasSemana semanas={resumo.semanas} rotulo="Novos acompanhamentos por semana" />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-brand-ink">Trilhas mais acompanhadas</h3>
          <Link href="/acompanhamentos" className="text-sm text-brand-trail underline">
            Andamento dos alunos
          </Link>
        </div>
        <ul className="mt-4 space-y-4">
          {resumo.ranking.map((t) => (
            <li key={t.id}>
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-brand-ink">{t.titulo}</p>
                  <p className="truncate text-xs text-slate-500">
                    {t.categoria} · {plural(t.alunos, "aluno", "alunos")}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-brand-ink">
                  {t.media}% <span className="font-normal text-slate-500">médio</span>
                </span>
              </div>
              <BarraTrilha percentual={t.media} />
            </li>
          ))}
        </ul>
      </section>

      <Atalhos />
    </AppShell>
  );
}
