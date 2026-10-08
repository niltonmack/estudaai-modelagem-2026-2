import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EstudaAI",
  icons: { icon: "/identidade/marca.svg" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-brand-paper text-brand-ink antialiased">{children}</body>
    </html>
  );
}
