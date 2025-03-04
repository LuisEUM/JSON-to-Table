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

// Tipo para la respuesta paginada
interface PaginatedResponse<T> {
  success: boolean;
  model: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
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

// Función para obtener datos paginados de un modelo
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener parámetros de la solicitud
    const model = req.nextUrl.searchParams.get("model");
    const pageStr = req.nextUrl.searchParams.get("page") || "1";
    const limitStr = req.nextUrl.searchParams.get("limit") || "50";
    const searchTerm = req.nextUrl.searchParams.get("search") || "";

    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);
    const skip = (page - 1) * limit;

    if (!model) {
      return NextResponse.json(
        { error: "Se requiere especificar un modelo" },
        { status: 400 }
      );
    }

    // Función para construir la condición de búsqueda
    const buildSearchFilter = (fields: string[]) => {
      if (!searchTerm) return {};

      return {
        OR: fields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive" as const,
          },
        })),
      };
    };

    let count = 0;
    let totalPages = 0;
    let formattedData: Record<string, string | boolean | number | null>[] = [];

    switch (model) {
      case "user": {
        // Campos para buscar en usuarios
        const userSearchFields = ["name", "email"];
        const userFilter = buildSearchFilter(userSearchFields);

        const data = await prisma.user.findMany({
          take: limit,
          skip: skip,
          where: userFilter,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        count = await prisma.user.count({
          where: userFilter,
        });

        formattedData = data.map((item: UserData) => formatDates(item));
        break;
      }

      case "account": {
        // Campos para buscar en cuentas
        const accountSearchFields = ["provider", "providerAccountId"];
        const accountFilter = buildSearchFilter(accountSearchFields);

        const data = await prisma.account.findMany({
          take: limit,
          skip: skip,
          where: accountFilter,
          select: {
            id: true,
            userId: true,
            type: true,
            provider: true,
            providerAccountId: true,
          },
        });

        count = await prisma.account.count({
          where: accountFilter,
        });

        formattedData = data.map((item: AccountData) => formatDates(item));
        break;
      }

      case "session": {
        const data = await prisma.session.findMany({
          take: limit,
          skip: skip,
          select: {
            id: true,
            sessionToken: true,
            userId: true,
            expires: true,
          },
          orderBy: {
            expires: "desc",
          },
        });

        count = await prisma.session.count();
        formattedData = data.map((item: SessionData) => formatDates(item));
        break;
      }

      case "view": {
        // Campos para buscar en vistas
        const viewSearchFields = ["name", "description"];
        const viewFilter = buildSearchFilter(viewSearchFields);

        const data = await prisma.view.findMany({
          take: limit,
          skip: skip,
          where: viewFilter,
          select: {
            id: true,
            name: true,
            description: true,
            userId: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        count = await prisma.view.count({
          where: viewFilter,
        });

        formattedData = data.map((item: ViewData) => formatDates(item));
        break;
      }

      default:
        return NextResponse.json(
          { error: "Modelo no válido" },
          { status: 400 }
        );
    }

    // Calcular el total de páginas
    totalPages = Math.ceil(count / limit);

    const response: PaginatedResponse<
      Record<string, string | boolean | number | null>
    > = {
      success: true,
      model,
      data: formattedData,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
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
