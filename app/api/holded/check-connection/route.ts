import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Función para manejar solicitudes GET a /api/holded/check-connection
export async function GET(req: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);

    // Obtener el token de API de los encabezados (si se proporciona)
    const apiKey = req.headers.get("X-Holded-Api-Key");

    // Verificar la autenticación
    if (!session && !apiKey) {
      return NextResponse.json(
        { error: "No autenticado. Proporcione una API Key o inicie sesión." },
        { status: 401 }
      );
    }

    // Configurar el token para la solicitud a la API de Holded
    const token = apiKey || process.env.HOLDED_API_KEY;

    if (!token) {
      return NextResponse.json(
        { error: "No se ha configurado una API Key para Holded." },
        { status: 400 }
      );
    }

    // En esta versión de demostración, simularemos una respuesta exitosa
    // En una implementación real, haríamos una solicitud a la API de Holded
    // para verificar que el token es válido

    // Simular verificación exitosa
    return NextResponse.json({
      success: true,
      message: "Conexión establecida correctamente con Holded",
    });
  } catch (error) {
    console.error("Error al verificar la conexión con Holded:", error);
    return NextResponse.json(
      {
        error: "Error al verificar la conexión con Holded",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
