import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Información básica sobre Prisma
    const info = {
      prismaModelNames: Object.keys(prisma),
      userModelExists: Boolean(prisma.user),
      userModelFunctions: prisma.user ? Object.keys(prisma.user) : null,
    };

    return NextResponse.json(info);
  } catch (error) {
    console.error("Error al inspeccionar Prisma:", error);
    return NextResponse.json(
      {
        message: "Error al inspeccionar Prisma",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
