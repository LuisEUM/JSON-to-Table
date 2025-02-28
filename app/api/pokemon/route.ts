import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendLogToClients } from "@/app/services/log-stream";

interface PokemonType {
  type: {
    name: string;
  };
}

interface PokemonAbility {
  ability: {
    name: string;
  };
}

interface PokemonStat {
  stat: {
    name: string;
  };
  base_stat: number;
}

// Función auxiliar para procesar un lote de Pokémon
async function processBatch(
  pokemonList: { name: string; url: string }[],
  startIndex: number,
  totalPokemon: number
) {
  return Promise.all(
    pokemonList.map(async (pokemon, index) => {
      const currentNumber = startIndex + index + 1;
      const progressPercent = Math.round((currentNumber / totalPokemon) * 100);

      try {
        const message = `[${progressPercent}%] Obteniendo datos de ${pokemon.name} (${currentNumber}/${totalPokemon})`;
        console.log(`API: ${message}`);
        sendLogToClients(message);

        const detailResponse = await fetch(pokemon.url);
        if (!detailResponse.ok) {
          const errorMessage = `⚠️ Error al obtener detalles de ${pokemon.name}: ${detailResponse.statusText}`;
          console.error(`API: ${errorMessage}`);
          sendLogToClients(errorMessage);
          return {
            name: pokemon.name,
            url: pokemon.url,
            error: `Failed to fetch details: ${detailResponse.statusText}`,
          };
        }

        const details = await detailResponse.json();
        sendLogToClients(
          `✓ ${pokemon.name} (#${details.id}) - ${details.types
            ?.map((t: PokemonType) => t.type.name)
            .join(", ")}`
        );

        return {
          id: details.id,
          name: details.name,
          height: details.height,
          weight: details.weight,
          base_experience: details.base_experience,
          types:
            details.types?.map((t: PokemonType) => t.type.name).join(", ") ||
            "",
          abilities:
            details.abilities
              ?.map((a: PokemonAbility) => a.ability.name)
              .join(", ") || "",
          stats: Object.fromEntries(
            details.stats?.map((s: PokemonStat) => [
              s.stat.name,
              s.base_stat,
            ]) || []
          ),
          sprites: {
            front_default: details.sprites?.front_default || null,
            back_default: details.sprites?.back_default || null,
          },
          species: details.species?.name || "",
          is_default: details.is_default || false,
          order: details.order || 0,
        };
      } catch (error) {
        const errorMessage = `⚠️ Error al procesar ${pokemon.name}: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`;
        console.error(`API: ${errorMessage}`);
        sendLogToClients(errorMessage);
        return {
          name: pokemon.name,
          url: pokemon.url,
          error: `Error processing details: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        };
      }
    })
  );
}

export async function GET(_request: NextRequest) {
  const limit = Number(_request.nextUrl.searchParams.get("limit")) || 1500;
  const batchSize = 100;

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
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    sendLogToClients(
      `📋 Se encontraron ${data.results?.length || 0} Pokémon en total`
    );

    if (
      !data.results ||
      !Array.isArray(data.results) ||
      data.results.length === 0
    ) {
      const errorMessage = "❌ No se encontraron Pokémon en la API";
      console.error(`API: ${errorMessage}`);
      sendLogToClients(errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    // Procesar los Pokémon en lotes
    const allResults = [];
    const totalBatches = Math.ceil(data.results.length / batchSize);

    for (let i = 0; i < data.results.length; i += batchSize) {
      const batch = data.results.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      sendLogToClients(
        `📦 Procesando lote ${batchNumber} de ${totalBatches}...`
      );
      const batchResults = await processBatch(batch, i, data.results.length);
      allResults.push(...batchResults);

      const processedCount = Math.min(i + batchSize, data.results.length);
      const progressPercent = Math.round(
        (processedCount / data.results.length) * 100
      );
      sendLogToClients(
        `✓ Lote ${batchNumber}/${totalBatches} completado - ${progressPercent}% total (${processedCount}/${data.results.length} Pokémon)`
      );
    }

    // Verificar resultados
    if (!allResults || allResults.length === 0) {
      const errorMessage =
        "❌ No se obtuvieron datos después del procesamiento";
      console.error(`API: ${errorMessage}`);
      sendLogToClients(errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Verificar errores
    const errors = allResults.filter((p) => p.error);
    if (errors.length > 0) {
      sendLogToClients(
        `⚠️ ${errors.length} Pokémon tuvieron errores durante el procesamiento`
      );
    }

    const successMessage = `✅ Proceso completado: ${allResults.length} Pokémon obtenidos correctamente`;
    console.log(`API: ${successMessage}`);
    sendLogToClients(successMessage);

    return NextResponse.json(allResults);
  } catch (error) {
    const errorMessage = `❌ Error en el proceso: ${
      error instanceof Error ? error.message : "Error desconocido"
    }`;
    console.error(`API: ${errorMessage}`);
    sendLogToClients(errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
