import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Myflow — sua vida organizada num só lugar",
  description:
    "Tarefas, estudos, saúde, despesas, lazer e aniversários, tudo dentro de um calendário e um dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
