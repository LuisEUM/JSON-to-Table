import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// Tipos para los datos específicos de cada modelo
type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

type AccountData = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
};

type SessionData = {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
};

type ViewData = {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Tipo para la respuesta de vista previa
interface PreviewResponse {
  success: boolean;
  model: string;
  count: number;
  data: Record<string, string | boolean | number | null>[];
}

// Función para formatear fechas en un objeto
function formatDates<T extends Record<string, unknown>>(
  obj: T
): Record<string, string | boolean | number | null> {
  const formatted: Record<string, string | boolean | number | null> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      formatted[key] = value.toISOString();
    } else {
      formatted[key] = value as string | boolean | number | null;
    }
  }

  return formatted;
}

// Función para obtener datos de muestra de un modelo específico
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el modelo solicitado
    const model = req.nextUrl.searchParams.get("model");

    if (!model) {
      return NextResponse.json(
        { error: "Se requiere especificar un modelo" },
        { status: 400 }
      );
    }

    let count = 0;
    let formattedData: Record<string, string | boolean | number | null>[] = [];

    switch (model) {
      case "user": {
        const data = await prisma.user.findMany({
          take: 10,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        count = await prisma.user.count();
        formattedData = data.map((item: UserData) => formatDates(item));
        break;
      }

      case "account": {
        const data = await prisma.account.findMany({
          take: 10,
          select: {
            id: true,
            userId: true,
            type: true,
            provider: true,
            providerAccountId: true,
          },
        });
        count = await prisma.account.count();
        formattedData = data.map((item: AccountData) => formatDates(item));
        break;
      }

      case "session": {
        const data = await prisma.session.findMany({
          take: 10,
          select: {
            id: true,
            sessionToken: true,
            userId: true,
            expires: true,
          },
        });
        count = await prisma.session.count();
        formattedData = data.map((item: SessionData) => formatDates(item));
        break;
      }

      case "view": {
        const data = await prisma.view.findMany({
          take: 10,
          select: {
            id: true,
            name: true,
            description: true,
            userId: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        count = await prisma.view.count();
        formattedData = data.map((item: ViewData) => formatDates(item));
        break;
      }

      default:
        return NextResponse.json(
          { error: "Modelo no válido" },
          { status: 400 }
        );
    }

    const response: PreviewResponse = {
      success: true,
      model,
      count,
      data: formattedData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al obtener datos del modelo:", error);
    return NextResponse.json(
      {
        error: "Error al obtener datos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
