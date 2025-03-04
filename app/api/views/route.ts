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

    // Validar datos
    if (!name || !configuration) {
      return NextResponse.json(
        { error: "Nombre y configuración son requeridos" },
        { status: 400 }
      );
    }

    // Crear vista
    const view = await prisma.view.create({
      data: {
        name,
        description,
        isPublic: !!isPublic,
        config: configuration,
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
