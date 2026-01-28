import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { ThemeProvider, ThemeToggle } from "@/components/theme";
import { AuthProvider, UserMenu } from "@/components/auth";

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
      <head>
        {/* Script para aplicar tema antes da renderização (evita flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('vtex-budget-audit-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            {/* Header com gradiente corporativo Amara NZero */}
            <header className="gradient-corporate text-white py-4 px-6 shadow-card">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Logo Amara NZero */}
                  <Image
                    src="/logo-amara.png"
                    alt="Amara NZero"
                    width={160}
                    height={48}
                    className="h-10 w-auto"
                    priority
                  />
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-white">
                      VTEX Budget Audit
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/90 hidden sm:block">
                    Comparador de Orçamentos vs Carrinhos
                  </span>
                  <ThemeToggle />
                  <UserMenu />
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto py-8 px-6">{children}</main>
            <footer className="bg-brand-black dark:bg-gray-800 text-white py-4 px-6 mt-8">
              <div className="max-w-7xl mx-auto text-center text-sm opacity-80">
                VTEX Budget Audit Dashboard — Amara NZero
              </div>
            </footer>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
