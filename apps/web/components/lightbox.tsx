"use client";

import { useEffect, useId } from "react";

export function Lightbox({
  titulo,
  onFechar,
  largo,
  sobre,
  children
}: {
  titulo: string;
  onFechar: () => void;
  largo?: boolean;
  sobre?: boolean;
  children: React.ReactNode;
}) {
  const tituloId = useId();

  useEffect(() => {
    function tecla(evento: KeyboardEvent) {
      if (evento.key !== "Escape") return;
      if (sobre) evento.stopImmediatePropagation();
      onFechar();
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", tecla, sobre);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", tecla, sobre);
    };
  }, [onFechar, sobre]);

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center bg-brand-ink/50 p-4 sm:items-center ${
        sobre ? "z-[60]" : "z-50"
      }`}
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className={`max-h-[85vh] w-full overflow-y-auto rounded-xl bg-white p-5 shadow-xl ${
          sobre ? "max-w-3xl" : largo ? "max-w-2xl" : "max-w-lg"
        }`}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 id={tituloId} className="text-lg font-semibold text-brand-ink">
            {titulo}
          </h3>
          <button
            type="button"
            onClick={onFechar}
            className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
