import { NextResponse } from "next/server";
// import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const testEmail = "simple-test@example.com";
    // const hashedPassword = await hash("Test12345", 10);

    // Crear un usuario con un método más simple
    const user = await prisma.user.create({
      data: {
        name: "Test Simple",
        email: testEmail,
        // Probamos sin el campo password
        role: "CLIENT",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en test-create:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
