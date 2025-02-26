import { NextRequest, NextResponse } from "next/server";
import { sendLogToClients } from "../logs/route";

interface HoldedCustomer {
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

async function fetchAllCustomers(
  holdedApiKey: string
): Promise<HoldedCustomer[]> {
  let allCustomers: HoldedCustomer[] = [];
  let page = 1;
  const limit = 100; // Holded API maximum limit
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  sendLogToClients("🚀 Iniciando obtención de clientes desde Holded...");

  while (true) {
    sendLogToClients(`📄 Obteniendo página ${page} de clientes...`);
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await fetch(
          `https://api.holded.com/api/invoicing/v1/contacts?page=${page}&limit=${limit}`,
          {
            headers: {
              key: holdedApiKey,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          const error = new HoldedApiError(
            `Error al obtener clientes (página ${page})`,
            response.status,
            { message: errorText }
          );
          sendLogToClients(`❌ ${error.message} - Status: ${error.status}`);
          throw error;
        }

        const customers = await response.json();
        const newTotal = allCustomers.length + customers.length;
        sendLogToClients(
          `✅ Página ${page}: ${customers.length} clientes obtenidos (Total: ${newTotal})`
        );

        allCustomers = allCustomers.concat(customers);

        if (customers.length < limit) {
          sendLogToClients(
            `✨ Proceso completado. Total de clientes: ${allCustomers.length}`
          );
          return allCustomers; // No more pages to fetch
        }

        page++;
        break; // Success, move to next page
      } catch (error) {
        if (error instanceof HoldedApiError && error.status === 429) {
          sendLogToClients(
            `⚠️ Límite de velocidad alcanzado, reintentando en ${retryDelay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retries++;
        } else {
          throw error; // Rethrow other errors
        }
      }
    }
    if (retries === maxRetries) {
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

    const allCustomers = await fetchAllCustomers(holdedApiKey);
    return NextResponse.json(allCustomers);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    sendLogToClients(`❌ Error: ${errorMessage}`);

    if (error instanceof HoldedApiError) {
      return NextResponse.json(
        {
          error: `Error al obtener clientes: ${error.message}`,
          status: error.status,
          details: error.details,
        },
        { status: error.status }
      );
    } else {
      return NextResponse.json(
        { error: `Error al obtener clientes: ${errorMessage}` },
        { status: 500 }
      );
    }
  }
}
