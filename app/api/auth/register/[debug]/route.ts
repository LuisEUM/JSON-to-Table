import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Debugging user creation...");

    // Generar un email único
    const testEmail = `test-debug-${Date.now()}@example.com`;
    console.log("Usando email único:", testEmail);

    // Hashear la contraseña
    const hashedPassword = await hash("Test12345", 10);

    try {
      // Crear el usuario con el enfoque simple que ya sabemos que funciona
      const user = await prisma.user.create({
        data: {
          name: "Test User",
          email: testEmail,
          password: hashedPassword,
          role: "CLIENT",
        },
      });

      return NextResponse.json({
        message: "Usuario de prueba creado con éxito",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasPassword: Boolean(user.password),
        },
      });
    } catch (error) {
      console.error("Error al crear usuario de prueba:", error);
      return NextResponse.json(
        {
          message: "Error al crear usuario de prueba",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error al crear usuario de prueba:", error);
    return NextResponse.json(
      {
        message: "Error al crear usuario de prueba",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
