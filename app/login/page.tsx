import Image from "next/image";
import { Suspense } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { LoginForm } from "./components/LoginForm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <section className="surface-grid relative hidden overflow-hidden border-r bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
        <Image
          src="/logo-amara.png"
          alt="Amara Net Zero"
          width={170}
          height={48}
          className="relative h-12 w-auto object-contain object-left"
          priority
        />
        <div className="relative max-w-xl space-y-5">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="size-3" /> Plataforma interna
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight xl:text-5xl">
            Operações VTEX com mais contexto e menos atrito.
          </h1>
          <p className="text-lg text-muted-foreground">
            O VTEX Tools reúne utilitários da Amara Net Zero em um workspace
            seguro, rápido e preparado para crescer.
          </p>
        </div>
        <p className="relative text-sm text-muted-foreground">
          Amara Net Zero · Tecnologia e operações
        </p>
      </section>
      <section className="flex min-w-0 items-center justify-center p-4 sm:p-6 md:p-10">
        <Card className="w-full max-w-md border-border/70 shadow-2xl shadow-primary/5">
          <CardHeader className="space-y-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Acessar VTEX Tools</CardTitle>
              <CardDescription>
                Use suas credenciais corporativas para continuar.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
