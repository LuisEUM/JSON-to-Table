import { NextRequest, NextResponse } from "next/server";
import { sendLogToClients } from "@/app/services/log-stream";
interface HoldedFunnel {
  id: string;
  name: string;
  stages: {
    stageId: string;
    key: string;
    name: string;
    desc: string;
    dealprobability: number;
  }[];
  labels: unknown[];
  preferences: unknown[];
  customFields: unknown[];
  won: {
    num: number;
    value: number;
  };
  lost: {
    num: number;
    value: number;
  };
  recentLeads: {
    num: number;
    value: number;
  };
  recentWon: {
    num: number;
    value: number;
  };
  recentLost: {
    num: number;
    value: number;
  };
  leads: {
    num: number;
    valueTotProbability: number;
    value: number;
  };
  [key: string]: unknown;
}

class HoldedApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "HoldedApiError";
  }
}

async function fetchAllFunnels(holdedApiKey: string): Promise<HoldedFunnel[]> {
  try {
    sendLogToClients("🚀 Iniciando obtención de embudos desde Holded...");

    let page = 1;
    const limit = 100; // Máximo número de embudos por página
    const allFunnels: HoldedFunnel[] = [];

    while (true) {
      sendLogToClients(`📄 Obteniendo página ${page} de embudos...`);

      let response;
      try {
        response = await fetch(
          `https://api.holded.com/api/crm/v1/funnels?page=${page}&limit=${limit}`,
          {
            headers: {
              key: holdedApiKey,
            },
          }
        );
      } catch (error) {
        sendLogToClients(
          `⚠️ Error de red al obtener embudos: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
        throw error;
      }

      // Manejar límite de tasa (rate limit)
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        const waitTime = parseInt(retryAfter, 10) * 1000;
        sendLogToClients(
          `⏳ Límite de tasa alcanzado. Esperando ${
            waitTime / 1000
          } segundos antes de reintentar...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        const error = new HoldedApiError(
          "Error al obtener embudos",
          response.status,
          { message: errorText }
        );
        sendLogToClients(`❌ ${error.message} - Status: ${error.status}`);
        throw error;
      }

      const funnels = await response.json();

      if (!Array.isArray(funnels)) {
        sendLogToClients(`⚠️ Respuesta inesperada de la API: no es un array`);
        break;
      }

      sendLogToClients(
        `✅ Página ${page}: Se han obtenido ${funnels.length} embudos`
      );
      allFunnels.push(...funnels);

      // Si recibimos menos embudos que el límite, hemos llegado al final
      if (funnels.length < limit) {
        break;
      }

      // Avanzar a la siguiente página
      page++;
    }

    // Obtener detalles de cada embudo (etapas)
    const funnelsWithDetails = await Promise.all(
      allFunnels.map(async (funnel: HoldedFunnel) => {
        try {
          sendLogToClients(
            `📄 Obteniendo detalles del embudo ${funnel.name}...`
          );

          const detailResponse = await fetch(
            `https://api.holded.com/api/crm/v1/funnels/${funnel.id}`,
            {
              headers: {
                key: holdedApiKey,
              },
            }
          );

          if (!detailResponse.ok) {
            sendLogToClients(
              `⚠️ No se pudieron obtener los detalles del embudo ${funnel.name}`
            );
            return funnel;
          }

          const detailedFunnel = await detailResponse.json();
          sendLogToClients(
            `✅ Embudo ${funnel.name}: ${
              detailedFunnel.stages?.length || 0
            } etapas`
          );

          return detailedFunnel;
        } catch {
          sendLogToClients(
            `⚠️ Error al obtener detalles del embudo ${funnel.name}`
          );
          return funnel;
        }
      })
    );

    sendLogToClients(
      `✨ Proceso completado. Total de embudos: ${funnelsWithDetails.length}`
    );

    return funnelsWithDetails;
  } catch (error) {
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    sendLogToClients("🔍 Verificando clave API de Holded...");
    const holdedApiKey = request.headers.get("X-Holded-Api-Key");

    if (!holdedApiKey) {
      const error = "Falta la clave API de Holded";
      sendLogToClients(`❌ ${error}`);
      return NextResponse.json({ error }, { status: 400 });
    }

    const allFunnels = await fetchAllFunnels(holdedApiKey);
    return NextResponse.json({
      success: true,
      data: allFunnels,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    sendLogToClients(`❌ Error: ${errorMessage}`);

    if (error instanceof HoldedApiError) {
      return NextResponse.json(
        {
          error: `Error al obtener embudos: ${error.message}`,
          status: error.status,
          details: error.details,
        },
        { status: error.status }
      );
    } else {
      return NextResponse.json(
        { error: `Error al obtener embudos: ${errorMessage}` },
        { status: 500 }
      );
    }
  }
}
