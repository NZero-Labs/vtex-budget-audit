import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, ThemeToggle } from "@/components/theme";

export const metadata: Metadata = {
  title: "VTEX Budget Audit | Amara NZero",
  description: "Dashboard para comparar orçamentos com carrinhos VTEX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <ThemeProvider defaultTheme="system">
          {/* Header com gradiente corporativo Amara NZero */}
          <header className="gradient-corporate text-white py-4 px-6 shadow-card">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Logo placeholder - substitua pelo logo real */}
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">VTEX Budget Audit</h1>
                  <span className="text-xs text-white/80">Amara NZero</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/90 hidden sm:block">
                  Comparador de Orçamentos vs Carrinhos
                </span>
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-8 px-6">
            {children}
          </main>
          <footer className="bg-brand-black dark:bg-gray-800 text-white py-4 px-6 mt-8">
            <div className="max-w-7xl mx-auto text-center text-sm opacity-80">
              VTEX Budget Audit Dashboard — Amara NZero
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
