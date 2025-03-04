import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tiene permisos para cambiar roles" },
        { status: 403 }
      );
    }

    // Obtener el ID del usuario y datos a actualizar
    const userId = params.id;
    const { role } = await request.json();

    // Validar el rol
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // Actualizar el rol del usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
