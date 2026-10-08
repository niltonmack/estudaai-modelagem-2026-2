function Inline({ texto }: { texto: string }) {
  const partes = texto.split(/(`[^`]+`)/g);
  return (
    <>
      {partes.map((parte, i) =>
        parte.startsWith("`") && parte.endsWith("`") ? (
          <code key={i} className="rounded bg-slate-100 px-1 font-mono text-[0.85em]">
            {parte.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{parte}</span>
        )
      )}
    </>
  );
}

export function MarkdownEtapa({ texto }: { texto: string }) {
  const blocos = texto.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      {blocos.map((bloco, i) => {
        const linhas = bloco.split("\n");
        const heading = bloco.match(/^(#{1,4})\s+(.*)$/);
        if (heading && linhas.length === 1) {
          const Tag = heading[1].length <= 2 ? "h4" : "h5";
          return (
            <Tag key={i} className="font-semibold text-brand-ink">
              <Inline texto={heading[2]} />
            </Tag>
          );
        }
        if (linhas.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "))) {
          return (
            <ul key={i} className="list-disc pl-5">
              {linhas.map((l, j) => (
                <li key={j}>
                  <Inline texto={l.trim().replace(/^[-*]\s+/, "")} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {linhas.map((l, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                <Inline texto={l.replace(/^#{1,4}\s+/, "")} />
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
