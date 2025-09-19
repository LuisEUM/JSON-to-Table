import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Obtener una vista específica por su ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Obtener la vista
    const view = await prisma.view.findUnique({
      where: { id },
    });

    // Verificar si la vista existe
    if (!view) {
      return NextResponse.json(
        { error: "Vista no encontrada" },
        { status: 404 }
      );
    }

    // Si la vista no es pública y no pertenece al usuario actual
    if (!view.isPublic && (!session?.user || view.userId !== session.user.id)) {
      return NextResponse.json(
        { error: "No autorizado para ver esta vista" },
        { status: 403 }
      );
    }

    return NextResponse.json({ view });
  } catch (error) {
    console.error("Error al obtener vista:", error);
    return NextResponse.json(
      { error: "Error al obtener vista" },
      { status: 500 }
    );
  }
}

// Actualizar una vista existente
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener la vista existente
    const existingView = await prisma.view.findUnique({
      where: { id },
    });

    // Verificar si la vista existe
    if (!existingView) {
      return NextResponse.json(
        { error: "Vista no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea propietario de la vista
    if (existingView.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para editar esta vista" },
        { status: 403 }
      );
    }

    // Obtener datos actualizados
    const { name, description, isPublic, configuration } = await request.json();

    // Validar datos básicos
    if (!name || !configuration) {
      return NextResponse.json(
        { error: "Nombre y configuración son requeridos" },
        { status: 400 }
      );
    }

    // Validar que haya filtros aplicados
    const hasFilters = 
      (configuration.columnFilters && configuration.columnFilters.length > 0) ||
      (configuration.globalFilter && configuration.globalFilter.trim() !== "");
    
    if (!hasFilters) {
      return NextResponse.json(
        { error: "Debes aplicar al menos un filtro antes de actualizar la vista" },
        { status: 400 }
      );
    }

    // Extraer metadata de columnas
    const columnMetadata = {
      availableColumns: Object.keys(configuration.columnVisibility || {}),
      filteredColumns: configuration.columnFilters?.map((f: { id: string }) => f.id) || [],
      sortedColumns: configuration.sorting?.map((s: { id: string }) => s.id) || [],
    };

    // Actualizar vista con metadata
    const updatedView = await prisma.view.update({
      where: { id },
      data: {
        name,
        description,
        isPublic: !!isPublic,
        config: {
          ...configuration,
          columnMetadata,
        },
      },
    });

    return NextResponse.json({ view: updatedView });
  } catch (error) {
    console.error("Error al actualizar vista:", error);
    return NextResponse.json(
      { error: "Error al actualizar vista" },
      { status: 500 }
    );
  }
}

// Eliminar una vista
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener la vista existente
    const view = await prisma.view.findUnique({
      where: { id },
    });

    // Verificar si la vista existe
    if (!view) {
      return NextResponse.json(
        { error: "Vista no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea propietario de la vista
    if (view.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta vista" },
        { status: 403 }
      );
    }

    // Eliminar vista
    await prisma.view.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Vista eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar vista:", error);
    return NextResponse.json(
      { error: "Error al eliminar vista" },
      { status: 500 }
    );
  }
}
