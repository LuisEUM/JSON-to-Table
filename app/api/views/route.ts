import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Obtener todas las vistas del usuario y las públicas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener vistas del usuario y públicas
    const views = await prisma.view.findMany({
      where: {
        OR: [
          { userId: session.user.id }, // Vistas del usuario
          { isPublic: true }, // Vistas públicas
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ views });
  } catch (error) {
    console.error("Error al obtener vistas:", error);
    return NextResponse.json(
      { error: "Error al obtener vistas" },
      { status: 500 }
    );
  }
}

// Crear una nueva vista
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener datos de la solicitud
    const { name, description, isPublic, configuration } = await request.json();

    // Validar datos básicos
    if (!name || !configuration) {
      return NextResponse.json(
        { error: "Nombre y configuración son requeridos" },
        { status: 400 }
      );
    }

    // Validar que haya filtros aplicados (columnFilters o globalFilter)
    const hasFilters = 
      (configuration.columnFilters && configuration.columnFilters.length > 0) ||
      (configuration.globalFilter && configuration.globalFilter.trim() !== "");
    
    if (!hasFilters) {
      return NextResponse.json(
        { error: "Debes aplicar al menos un filtro antes de guardar la vista" },
        { status: 400 }
      );
    }

    // Extraer metadata de columnas para validación futura
    const columnMetadata = {
      availableColumns: Object.keys(configuration.columnVisibility || {}),
      filteredColumns: configuration.columnFilters?.map((f: { id: string }) => f.id) || [],
      sortedColumns: configuration.sorting?.map((s: { id: string }) => s.id) || [],
    };

    // Crear vista con metadata de columnas
    const view = await prisma.view.create({
      data: {
        name,
        description,
        isPublic: !!isPublic,
        config: {
          ...configuration,
          columnMetadata, // Guardar metadata para validación de compatibilidad
        },
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return NextResponse.json({ view }, { status: 201 });
  } catch (error) {
    console.error("Error al crear vista:", error);
    return NextResponse.json(
      { error: "Error al crear vista" },
      { status: 500 }
    );
  }
}
