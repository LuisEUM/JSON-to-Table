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

// Determina si una vista (pública, de otra tabla) es compatible con la tabla actual.
// Solo se aplica a vistas que NO son del usuario: las propias siempre se muestran.
function isViewCompatible(
  view: { config: unknown },
  compatibilityHash: string | null,
  currentColumns: string[]
): boolean {
  const config = view.config as Record<string, Record<string, unknown> | undefined>;
  const viewMetadata = (config.tableMetadata || config.columnMetadata) as
    | Record<string, unknown>
    | undefined; // Soporte para formato anterior

  if (!viewMetadata) return false; // Sin metadata, no se puede determinar compatibilidad

  // Verificar compatibilidad por hash
  if (compatibilityHash && viewMetadata.compatibilityHash) {
    return viewMetadata.compatibilityHash === compatibilityHash;
  }

  // Verificar compatibilidad por columnas (método de respaldo)
  if (currentColumns.length > 0 && viewMetadata.availableColumns) {
    const viewColumns = (viewMetadata.availableColumns as string[]).filter(
      (col: string) => !["index", "selection", "actions"].includes(col)
    );
    const currentCoreColumns = currentColumns.filter(
      (col) => !["index", "selection", "actions"].includes(col)
    );

    // Sin columnas reales que comparar: no se puede determinar compatibilidad.
    // Evita el caso 0 / 0 = NaN (NaN >= 0.7 === false).
    if (viewColumns.length === 0) return false;

    // Verificar que al menos el 70% de las columnas de la vista estén disponibles
    const matchingColumns = viewColumns.filter((col: string) =>
      currentCoreColumns.includes(col)
    );
    const compatibilityRatio = matchingColumns.length / viewColumns.length;

    return compatibilityRatio >= 0.7;
  }

  return false;
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
    // Filtrar cadenas vacías: "columns=" produce [""], que no son columnas reales
    const currentColumns = (searchParams.get("columns")?.split(",") || []).filter(
      Boolean
    );

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

    const shouldFilter = !!compatibilityHash || currentColumns.length > 0;

    // El filtro de compatibilidad solo se aplica a vistas públicas de OTROS
    // usuarios/tablas. Las vistas propias del usuario siempre se muestran: no
    // deben ocultarse por metadata de columnas incompleta.
    const compatibleViews = allViews.filter((view) => {
      if (view.userId === session.user.id) return true; // propias: siempre visibles
      if (!shouldFilter) return true;
      return isViewCompatible(view, compatibilityHash, currentColumns);
    });

    return NextResponse.json({
      views: compatibleViews,
      totalViews: allViews.length,
      compatibleViews: compatibleViews.length,
      filtered: shouldFilter,
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
