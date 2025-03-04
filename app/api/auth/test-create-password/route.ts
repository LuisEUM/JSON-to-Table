import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const testEmail = "test-with-password@example.com";
    const hashedPassword = await hash("Test12345", 10);

    // Crear un usuario incluyendo el campo password
    const user = await prisma.user.create({
      data: {
        name: "Test With Password",
        email: testEmail,
        password: hashedPassword,
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
        hasPassword: Boolean(user.password),
      },
    });
  } catch (error) {
    console.error("Error en test-create-password:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
