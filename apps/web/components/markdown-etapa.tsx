function Inline({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {partes.map((parte, i) => {
        if (parte.startsWith("**") && parte.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-brand-ink">
              {parte.slice(2, -2)}
            </strong>
          );
        }
        if (parte.startsWith("`") && parte.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-slate-100 px-1 font-mono text-[0.85em]">
              {parte.slice(1, -1)}
            </code>
          );
        }
        const link = parte.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <a key={i} href={link[2]} className="text-brand-trail underline" target="_blank" rel="noreferrer">
              {link[1]}
            </a>
          );
        }
        return <span key={i}>{parte}</span>;
      })}
    </>
  );
}

type Bloco =
  | { tipo: "titulo"; nivel: number; texto: string }
  | { tipo: "codigo"; texto: string }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "numerada"; itens: string[] }
  | { tipo: "tabela"; linhas: string[][] }
  | { tipo: "paragrafo"; linhas: string[] };

function parsear(texto: string): Bloco[] {
  const linhas = texto.replace(/\r\n/g, "\n").trim().split("\n");
  const blocos: Bloco[] = [];
  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];
    if (!linha.trim()) {
      i += 1;
      continue;
    }
    if (linha.trim().startsWith("```")) {
      const codigo: string[] = [];
      i += 1;
      while (i < linhas.length && !linhas[i].trim().startsWith("```")) {
        codigo.push(linhas[i]);
        i += 1;
      }
      i += 1;
      blocos.push({ tipo: "codigo", texto: codigo.join("\n") });
      continue;
    }
    const titulo = linha.match(/^(#{1,4})\s+(.*)$/);
    if (titulo) {
      blocos.push({ tipo: "titulo", nivel: titulo[1].length, texto: titulo[2] });
      i += 1;
      continue;
    }
    if (linha.includes("|") && linhas[i + 1]?.trim().match(/^\|?[\s:-]+\|/)) {
      const tabela: string[][] = [];
      while (i < linhas.length && linhas[i].includes("|")) {
        if (!linhas[i].trim().match(/^\|?[\s:-]+\|/)) {
          tabela.push(
            linhas[i]
              .split("|")
              .map((celula) => celula.trim())
              .filter((celula, indice, todas) => celula || (indice > 0 && indice < todas.length - 1))
          );
        }
        i += 1;
      }
      blocos.push({ tipo: "tabela", linhas: tabela.filter((l) => l.length > 0) });
      continue;
    }
    if (linha.trim().startsWith("- ") || linha.trim().startsWith("* ")) {
      const itens: string[] = [];
      while (i < linhas.length && (linhas[i].trim().startsWith("- ") || linhas[i].trim().startsWith("* "))) {
        itens.push(linhas[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocos.push({ tipo: "lista", itens });
      continue;
    }
    if (/^\d+\.\s+/.test(linha.trim())) {
      const itens: string[] = [];
      while (i < linhas.length && /^\d+\.\s+/.test(linhas[i].trim())) {
        itens.push(linhas[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocos.push({ tipo: "numerada", itens });
      continue;
    }
    const paragrafo: string[] = [];
    while (
      i < linhas.length &&
      linhas[i].trim() &&
      !linhas[i].trim().startsWith("```") &&
      !/^(#{1,4})\s+/.test(linhas[i]) &&
      !linhas[i].trim().startsWith("- ") &&
      !/^\d+\.\s+/.test(linhas[i].trim())
    ) {
      paragrafo.push(linhas[i]);
      i += 1;
    }
    blocos.push({ tipo: "paragrafo", linhas: paragrafo });
  }
  return blocos;
}

export function MarkdownEtapa({ texto }: { texto: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-700">
      {parsear(texto).map((bloco, i) => {
        if (bloco.tipo === "titulo") {
          return (
            <h4 key={i} className="font-semibold text-brand-ink">
              <Inline texto={bloco.texto} />
            </h4>
          );
        }
        if (bloco.tipo === "codigo") {
          return (
            <pre key={i} className="overflow-x-auto rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-50">
              <code>{bloco.texto}</code>
            </pre>
          );
        }
        if (bloco.tipo === "lista") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {bloco.itens.map((item, j) => (
                <li key={j}>
                  <Inline texto={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (bloco.tipo === "numerada") {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {bloco.itens.map((item, j) => (
                <li key={j}>
                  <Inline texto={item} />
                </li>
              ))}
            </ol>
          );
        }
        if (bloco.tipo === "tabela") {
          return (
            <div key={i} className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <tbody>
                  {bloco.linhas.map((linha, j) => (
                    <tr key={j} className={j === 0 ? "font-medium text-brand-ink" : ""}>
                      {linha.map((celula, k) => (
                        <td key={k} className="border border-slate-200 px-2 py-1">
                          <Inline texto={celula} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={i}>
            {bloco.linhas.map((linha, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                <Inline texto={linha} />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function BarraProgresso({ feitos, total }: { feitos: number; total: number }) {
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  return (
    <div>
      <p className="text-sm font-medium text-brand-ink">
        Progresso: {feitos} de {total} etapas <span className="font-normal text-slate-500">({pct}%)</span>
      </p>
      <p className="text-xs text-slate-500">O percentual é calculado automaticamente.</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
        <div className="h-full rounded-full bg-brand-trail" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
