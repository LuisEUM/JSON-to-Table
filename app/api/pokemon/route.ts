import type { NextRequest } from "next/server";
import { sendLogToClients } from "@/app/services/log-stream";

export async function GET(_request: NextRequest) {
  const limit = Number(_request.nextUrl.searchParams.get("limit")) || 1500;

  try {
    const message = `🚀 Iniciando búsqueda de ${limit} Pokémon...`;
    console.log(`API: ${message}`);
    sendLogToClients(message);

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}`
    );

    if (!response.ok) {
      const errorMessage = `⚠️ Error al obtener lista de Pokémon: ${response.statusText}`;
      console.error(`API: ${errorMessage}`);
      sendLogToClients(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    sendLogToClients(
      `📋 Se encontraron ${data.results?.length || 0} Pokémon en total`
    );
  } catch (error) {
    const errorMessage = `⚠️ Error al procesar la solicitud: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    console.error(`API: ${errorMessage}`);
    sendLogToClients(errorMessage);
    throw error;
  }
}
