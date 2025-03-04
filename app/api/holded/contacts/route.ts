import { NextRequest, NextResponse } from "next/server";
import { sendLogToClients } from "@/app/services/log-stream";

interface HoldedContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  customer_group?: string;
  notes?: string;
  created_at?: string;
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

async function fetchAllContacts(
  holdedApiKey: string
): Promise<HoldedContact[]> {
  let allContacts: HoldedContact[] = [];
  let page = 1;
  const limit = 100; // Holded API maximum limit
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  sendLogToClients("🚀 Iniciando obtención de contactos desde Holded...");

  while (true) {
    sendLogToClients(`📄 Obteniendo página ${page} de contactos...`);
    let retries = 0;
    let success = false;

    while (retries < maxRetries && !success) {
      try {
        const response = await fetch(
          `https://api.holded.com/api/invoicing/v1/contacts?page=${page}&limit=${limit}`,
          {
            headers: {
              key: holdedApiKey,
              accept: "application/json",
            },
          }
        );

        if (response.status === 429) {
          const waitTime = retryDelay * (retries + 1);
          sendLogToClients(
            `⚠️ Límite de velocidad alcanzado, reintentando en ${waitTime}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          retries++;
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          const error = new HoldedApiError(
            `Error al obtener contactos (página ${page})`,
            response.status,
            { message: errorText }
          );
          sendLogToClients(`❌ ${error.message} - Status: ${error.status}`);
          throw error;
        }

        const contacts = await response.json();
        if (!Array.isArray(contacts)) {
          sendLogToClients(
            `⚠️ Respuesta inesperada: No es un array de contactos`
          );
          throw new Error("Formato de respuesta inesperado");
        }

        const newTotal = allContacts.length + contacts.length;
        sendLogToClients(
          `✅ Página ${page}: ${contacts.length} contactos obtenidos (Total: ${newTotal})`
        );

        allContacts = allContacts.concat(contacts);
        success = true;

        if (contacts.length < limit) {
          sendLogToClients(
            `✨ Proceso completado. Total de contactos: ${allContacts.length}`
          );
          return allContacts; // No more pages to fetch
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        page++;
      } catch (error) {
        if (error instanceof HoldedApiError && error.status === 429) {
          const waitTime = retryDelay * (retries + 1);
          sendLogToClients(
            `⚠️ Límite de velocidad alcanzado, reintentando en ${waitTime}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          retries++;
        } else {
          throw error; // Rethrow other errors
        }
      }
    }

    if (!success) {
      const error = new Error(`Error después de ${maxRetries} intentos`);
      sendLogToClients(`❌ ${error.message}`);
      throw error;
    }
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

    const allContacts = await fetchAllContacts(holdedApiKey);
    return NextResponse.json({
      success: true,
      data: allContacts,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    sendLogToClients(`❌ Error: ${errorMessage}`);

    if (error instanceof HoldedApiError) {
      return NextResponse.json(
        {
          error: `Error al obtener contactos: ${error.message}`,
          status: error.status,
          details: error.details,
        },
        { status: error.status }
      );
    } else {
      return NextResponse.json(
        { error: `Error al obtener contactos: ${errorMessage}` },
        { status: 500 }
      );
    }
  }
}
