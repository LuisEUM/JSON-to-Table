import { NextRequest, NextResponse } from "next/server";
import { sendLogToClients } from "@/app/services/log-stream";

interface HoldedLead {
  id: string;
  userId: string;
  funnelId: string;
  contactId: string;
  contactName: string;
  name: string;
  person: string;
  personName: string;
  value: number;
  potential: number | null;
  dueDate: number;
  stageId: string;
  createdAt: number;
  updatedAt: number;
  updatedHash: string;
  customFields: Record<string, unknown>[];
  status: number;
  events: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  files: Record<string, unknown>[];
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

async function fetchAllLeads(holdedApiKey: string): Promise<HoldedLead[]> {
  try {
    sendLogToClients("🚀 Iniciando obtención de leads desde Holded...");

    const response = await fetch("https://api.holded.com/api/crm/v1/leads", {
      headers: {
        key: holdedApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new HoldedApiError(
        "Error al obtener leads",
        response.status,
        { message: errorText }
      );
      sendLogToClients(`❌ ${error.message} - Status: ${error.status}`);
      throw error;
    }

    const leads = await response.json();

    sendLogToClients(`✅ Se han obtenido ${leads.length} leads`);

    return leads;
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

    const allLeads = await fetchAllLeads(holdedApiKey);
    return NextResponse.json({
      success: true,
      data: allLeads,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    sendLogToClients(`❌ Error: ${errorMessage}`);

    if (error instanceof HoldedApiError) {
      return NextResponse.json(
        {
          error: `Error al obtener leads: ${error.message}`,
          status: error.status,
          details: error.details,
        },
        { status: error.status }
      );
    } else {
      return NextResponse.json(
        { error: `Error al obtener leads: ${errorMessage}` },
        { status: 500 }
      );
    }
  }
}
