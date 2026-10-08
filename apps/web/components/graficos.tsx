import { Semana } from "@/lib/inicio";

export function Rosca({ percentual, tamanho = 148 }: { percentual: number; tamanho?: number }) {
  const raio = 52;
  const circunferencia = 2 * Math.PI * raio;
  const cheio = (Math.min(100, Math.max(0, percentual)) / 100) * circunferencia;
  return (
    <svg viewBox="0 0 140 140" width={tamanho} height={tamanho} role="img" aria-label={`Avanço geral: ${percentual}%`}>
      <circle cx="70" cy="70" r={raio} fill="none" stroke="#D7F0ED" strokeWidth="16" />
      {cheio > 0 ? (
        <circle
          cx="70"
          cy="70"
          r={raio}
          fill="none"
          stroke="#1A7A72"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${cheio} ${circunferencia}`}
          transform="rotate(-90 70 70)"
        />
      ) : null}
      <text x="70" y="68" textAnchor="middle" fontSize="26" fontWeight="700" fill="#123047">
        {percentual}%
      </text>
      <text x="70" y="88" textAnchor="middle" fontSize="11" fill="#5B6B73">
        concluído
      </text>
    </svg>
  );
}

export function ColunasSemana({
  semanas,
  rotulo = "Etapas concluídas por semana"
}: {
  semanas: Semana[];
  rotulo?: string;
}) {
  const maximo = Math.max(1, ...semanas.map((s) => s.quantidade));
  const descricao = semanas.map((s) => `semana de ${s.rotulo}: ${s.quantidade}`).join("; ");
  return (
    <div className="flex h-40 items-end gap-1.5 sm:gap-2" role="img" aria-label={`${rotulo} — ${descricao}`}>
      {semanas.map((semana, i) => (
        <div key={semana.rotulo} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-medium text-slate-500">{semana.quantidade || ""}</span>
          <div
            className={`w-full rounded-t-md ${i === semanas.length - 1 ? "bg-brand-trail" : "bg-brand-trail/40"}`}
            style={{ height: `${Math.max(4, (semana.quantidade / maximo) * 96)}px` }}
          />
          <span className="truncate text-[10px] text-slate-400">{semana.rotulo}</span>
        </div>
      ))}
    </div>
  );
}

export function BarraTrilha({ percentual }: { percentual: number }) {
  return (
    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand-mint" aria-hidden="true">
      <div className="h-full rounded-full bg-brand-trail" style={{ width: `${percentual}%` }} />
    </div>
  );
}
