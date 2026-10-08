export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen md:grid-cols-2">
        <aside className="hidden flex-col justify-between bg-brand-ink p-10 text-white md:flex">
          <div>
            <img src="/identidade/logo-horizontal-inverso.svg" alt="EstudaAI" className="h-9 w-auto" />
            <h1 className="mt-8 text-3xl font-semibold leading-tight">
              Trilhas de aprendizagem com curadoria e apoio de um agente.
            </h1>
            <p className="mt-4 max-w-sm text-brand-mint">
              Cadastre-se como aluno. A área administrativa é separada.
            </p>
          </div>
          <p className="text-xs text-brand-mint">EstudaAI</p>
        </aside>
        <section className="flex items-start justify-center p-6 sm:items-center sm:p-10">
          <div className="w-full max-w-sm">{children}</div>
        </section>
      </div>
    </div>
  );
}

export function Campo({
  label,
  type,
  name,
  placeholder,
  autoComplete
}: {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm font-medium leading-snug text-slate-700">
      {label}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-trail focus:border-brand-trail focus:ring-2"
      />
    </label>
  );
}

export function Botao({
  children,
  kind = "primary",
  disabled
}: {
  children: React.ReactNode;
  kind?: "primary" | "secondary";
  disabled?: boolean;
}) {
  const cls =
    kind === "primary"
      ? "w-full rounded-md bg-brand-trail px-3 py-2 text-sm font-medium leading-snug text-white hover:bg-brand-trailDark disabled:opacity-60"
      : "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium leading-snug text-slate-700 hover:bg-slate-50";
  return (
    <button type="submit" disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function Alerta({ texto, tom = "red" }: { texto: string; tom?: "red" | "green" | "amber" }) {
  const cls =
    tom === "red"
      ? "border-red-200 bg-red-50 text-red-800"
      : tom === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-950"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";
  return (
    <div className={`rounded-md border px-3 py-2 text-sm leading-relaxed ${cls}`} role="alert">
      {texto}
    </div>
  );
}
