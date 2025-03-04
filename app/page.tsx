import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir a la página de selección de fuentes de datos
  redirect("/data-sources");
}
