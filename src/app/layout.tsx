import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-logo",
});

export const metadata: Metadata = {
  title: "Myflow — sua vida organizada num só lugar",
  description:
    "Tarefas, estudos, saúde, despesas, lazer e aniversários, tudo dentro de um calendário e um dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
