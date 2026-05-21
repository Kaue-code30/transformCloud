import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const poppins = Poppins({ 
  variable: "--font-poppins", 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"]
});

export const metadata: Metadata = {
  title: "TransformCloud — Inteligência para sua infraestrutura cloud",
  description:
    "Custos, portabilidade, eficiência e migração inteligente. Devolva o controle da sua nuvem para a sua empresa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
