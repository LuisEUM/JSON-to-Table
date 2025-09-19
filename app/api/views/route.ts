import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Función para generar un hash de compatibilidad basado en columnas
function generateTableCompatibilityHash(columns: string[]): string {
  // Ordenar columnas para generar un hash consistente
  const sortedColumns = [...columns].sort();
  // Crear un hash simple basado en las columnas principales (excluyendo index, selection, actions)
  const coreColumns = sortedColumns.filter(
    (col) => !["index", "selection", "actions"].includes(col)
  );
  return Buffer.from(coreColumns.join("|")).toString("base64").slice(0, 16);
}

// Obtener vistas del usuario y las públicas, con filtrado opcional por compatibilidad
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const compatibilityHash = searchParams.get("compatibilityHash");
    const currentColumns = searchParams.get("columns")?.split(",") || [];

    // Obtener todas las vistas del usuario y públicas
    const allViews = await prisma.view.findMany({
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

    // Si se proporciona hash de compatibilidad o columnas actuales, filtrar vistas compatibles
    let compatibleViews = allViews;

    if (compatibilityHash || currentColumns.length > 0) {
      compatibleViews = allViews.filter((view) => {
        const config = view.config as any;
        const viewMetadata = config.tableMetadata || config.columnMetadata; // Soporte para formato anterior

        if (!viewMetadata) return false; // Sin metadata, no se puede determinar compatibilidad

        // Verificar compatibilidad por hash
        if (compatibilityHash && viewMetadata.compatibilityHash) {
          return viewMetadata.compatibilityHash === compatibilityHash;
        }

        // Verificar compatibilidad por columnas (método de respaldo)
        if (currentColumns.length > 0 && viewMetadata.availableColumns) {
          const viewColumns = viewMetadata.availableColumns.filter(
            (col: string) => !["index", "selection", "actions"].includes(col)
          );
          const currentCoreColumns = currentColumns.filter(
            (col) => !["index", "selection", "actions"].includes(col)
          );

          // Verificar que al menos el 70% de las columnas de la vista estén disponibles
          const matchingColumns = viewColumns.filter((col: string) =>
            currentCoreColumns.includes(col)
          );
          const compatibilityRatio =
            matchingColumns.length / viewColumns.length;

          return compatibilityRatio >= 0.7;
        }

        return false;
      });
    }

    return NextResponse.json({
      views: compatibleViews,
      totalViews: allViews.length,
      compatibleViews: compatibleViews.length,
      filtered: compatibilityHash || currentColumns.length > 0,
    });
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

    // Extraer metadata de tabla y columnas para validación futura
    const tableMetadata = {
      // Información básica de la tabla
      totalColumns: Object.keys(configuration.columnVisibility || {}).length,
      availableColumns: Object.keys(configuration.columnVisibility || {}),
      columnTypes: configuration.columnTypes || {}, // Tipos de columnas si están disponibles

      // Información de filtros aplicados
      filteredColumns:
        configuration.columnFilters?.map((f: { id: string }) => f.id) || [],
      sortedColumns:
        configuration.sorting?.map((s: { id: string }) => s.id) || [],

      // Hash de compatibilidad basado en columnas principales
      compatibilityHash: generateTableCompatibilityHash(
        Object.keys(configuration.columnVisibility || {})
      ),

      // Timestamp para identificar versiones de la estructura
      schemaVersion: "1.0",
      createdWith: {
        timestamp: new Date().toISOString(),
        columnCount: Object.keys(configuration.columnVisibility || {}).length,
      },
    };

    // Crear vista con metadata de tabla
    const view = await prisma.view.create({
      data: {
        name,
        description,
        isPublic: !!isPublic,
        config: {
          ...configuration,
          tableMetadata, // Guardar metadata completa para validación de compatibilidad
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
