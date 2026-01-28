import { redirect } from "next/navigation";

/**
 * Página raiz - redireciona para /compare
 */
export default function Home() {
  redirect("/compare");
}
