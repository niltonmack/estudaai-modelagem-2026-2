"use client";

import { useEffect } from "react";

export function Lightbox({
  titulo,
  onFechar,
  largo,
  children
}: {
  titulo: string;
  onFechar: () => void;
  largo?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function tecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onFechar();
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", tecla);
    };
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/50 p-4 sm:items-center"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-titulo"
        className={`max-h-[85vh] w-full overflow-y-auto rounded-xl bg-white p-5 shadow-xl ${
          largo ? "max-w-2xl" : "max-w-lg"
        }`}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 id="lightbox-titulo" className="text-lg font-semibold text-brand-ink">
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
