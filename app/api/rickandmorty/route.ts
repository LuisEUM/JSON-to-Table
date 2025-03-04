import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendLogToClients } from "@/app/services/log-stream";

interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

interface ApiResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
}

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const page = Number(request.nextUrl.searchParams.get("page")) || 1;

    const message = `🚀 Iniciando búsqueda de personajes de Rick and Morty (página ${page})...`;
    console.log(`API: ${message}`);
    sendLogToClients(message);

    // Hacer solicitud a la API de Rick and Morty
    const response = await fetch(
      `https://rickandmortyapi.com/api/character?page=${page}`
    );

    if (!response.ok) {
      const errorMessage = `⚠️ Error al obtener personajes: ${response.statusText}`;
      console.error(`API: ${errorMessage}`);
      sendLogToClients(errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data: ApiResponse = await response.json();

    sendLogToClients(
      `📋 Se encontraron ${
        data.results?.length || 0
      } personajes en la página ${page} (Total: ${data.info?.count || 0})`
    );

    if (
      !data.results ||
      !Array.isArray(data.results) ||
      data.results.length === 0
    ) {
      const errorMessage = "❌ No se encontraron personajes en la API";
      console.error(`API: ${errorMessage}`);
      sendLogToClients(errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    // Procesar los datos para obtener un formato más adecuado para la tabla
    const processedData = data.results.map((character) => {
      const progressPercent = Math.round(
        ((data.results.indexOf(character) + 1) / data.results.length) * 100
      );

      sendLogToClients(
        `[${progressPercent}%] Procesando personaje: ${character.name}`
      );

      return {
        id: character.id,
        name: character.name,
        status: character.status,
        species: character.species,
        type: character.type || "N/A",
        gender: character.gender,
        origin: character.origin?.name || "Unknown",
        location: character.location?.name || "Unknown",
        image: character.image,
        episodes: character.episode?.length || 0,
        created: character.created,
        url: character.url,
      };
    });

    const successMessage = `✅ Proceso completado: ${processedData.length} personajes procesados correctamente`;
    console.log(`API: ${successMessage}`);
    sendLogToClients(successMessage);

    // Devolver los datos procesados junto con metadatos de paginación
    return NextResponse.json({
      data: processedData,
      pagination: {
        currentPage: page,
        totalPages: data.info.pages,
        totalItems: data.info.count,
        hasNextPage: !!data.info.next,
        hasPreviousPage: !!data.info.prev,
      },
    });
  } catch (error) {
    const errorMessage = `❌ Error en el proceso: ${
      error instanceof Error ? error.message : "Error desconocido"
    }`;
    console.error(`API: ${errorMessage}`);
    sendLogToClients(errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
