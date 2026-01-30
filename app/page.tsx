import { redirect } from "next/navigation";

/**
 * Página raiz - redireciona para /home (seleção de tipo de comparação)
 */
export default function Home() {
  redirect("/home");
}
