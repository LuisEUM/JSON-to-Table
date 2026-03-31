import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { UserRole, Prisma } from "@prisma/client";

// Esquema de validación
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

// Función para determinar el rol basado en el dominio del correo
const getRoleFromEmail = (email: string): UserRole => {
  const lowercaseEmail = email.toLowerCase();
  if (
    lowercaseEmail.endsWith("@insidesalons.com") ||
    lowercaseEmail.endsWith("@insidehair.es")
  ) {
    return "EMPLOYEE";
  }
  return "CLIENT";
};

export async function POST(request: NextRequest) {
  try {
    // Obtener y validar los datos del usuario
    const body = await request.json();
    console.log("Datos recibidos:", {
      ...body,
      password: body.password ? "***" : undefined,
    });

    const validationResult = userSchema.safeParse(body);

    if (!validationResult.success) {
      console.log("Error de validación:", validationResult.error.issues);
      return NextResponse.json(
        {
          message: "Datos de usuario inválidos",
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;
    console.log("Datos validados:", {
      name,
      email,
      passwordLength: password.length,
    });

    // Verificar si el usuario ya existe
    console.log("Verificando si el usuario ya existe:", email);
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      console.log("Usuario existente encontrado con email:", email);
      return NextResponse.json(
        { message: "Este correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    console.log("Hasheando contraseña...");
    const hashedPassword = await hash(password, 10);

    // Determinar el rol basado en el correo electrónico
    const role = getRoleFromEmail(email);
    console.log("Rol asignado:", role);

    try {
      // Crear el usuario con el enfoque simple que ya sabemos que funciona
      console.log("Creando usuario en la base de datos...");
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      console.log("Usuario creado con éxito:", user.id);

      // Retornar los datos del usuario (excluyendo la contraseña)
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
      // Capturar errores específicos de Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(
          "Error de Prisma al crear usuario:",
          error.message,
          error.code
        );
        return NextResponse.json(
          {
            success: false,
            message: "Error al crear el usuario en la base de datos",
            code: error.code,
          },
          { status: 500 }
        );
      }

      console.error("Error desconocido de BD:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Error al crear el usuario en la base de datos",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error general al registrar usuario:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar la solicitud de registro",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
