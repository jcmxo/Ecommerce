import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Admin - Panel de Administración",
  description: "Panel de administración para empresas del e-commerce blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}

