import { prisma } from "@/lib/prisma";
import type { View, Prisma } from "@prisma/client";

interface ViewConfig {
  name: string;
  description?: string;
  isPublic?: boolean;
  configuration: Record<string, unknown>;
}

export class ViewService {
  /**
   * Obtiene todas las vistas de un usuario
   */
  static async getUserViews(userEmail: string): Promise<View[]> {
    // Primero obtenemos el usuario
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Obtenemos las vistas del usuario y las públicas
    return prisma.view.findMany({
      where: {
        OR: [{ userId: user.id }, { isPublic: true }],
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Obtiene una vista específica por su ID
   */
  static async getView(viewId: string): Promise<View> {
    const view = await prisma.view.findUnique({
      where: { id: viewId },
    });

    if (!view) {
      throw new Error("Vista no encontrada");
    }

    return view;
  }

  /**
   * Guarda una nueva vista para un usuario
   */
  static async saveView(
    userEmail: string,
    viewConfig: ViewConfig
  ): Promise<View> {
    // Aseguramos que el usuario existe
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // Si el usuario no existe, lo creamos
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userEmail.split("@")[0], // Nombre básico a partir del email
        },
      });
    }

    // Creamos la vista
    return prisma.view.create({
      data: {
        name: viewConfig.name,
        description: viewConfig.description || "",
        isPublic: viewConfig.isPublic || false,
        config: viewConfig.configuration as Prisma.InputJsonValue,
        userId: user.id,
      },
    });
  }

  /**
   * Actualiza una vista existente
   */
  static async updateView(
    viewId: string,
    userEmail: string,
    viewConfig: Partial<ViewConfig>
  ): Promise<View> {
    // Verificamos que la vista existe y pertenece al usuario
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const view = await prisma.view.findUnique({
      where: { id: viewId },
    });

    if (!view) {
      throw new Error("Vista no encontrada");
    }

    if (view.userId !== user.id) {
      throw new Error("No tienes permiso para modificar esta vista");
    }

    // Actualizamos la vista
    return prisma.view.update({
      where: { id: viewId },
      data: {
        name: viewConfig.name !== undefined ? viewConfig.name : view.name,
        description:
          viewConfig.description !== undefined
            ? viewConfig.description
            : view.description,
        isPublic:
          viewConfig.isPublic !== undefined
            ? viewConfig.isPublic
            : view.isPublic,
        config:
          viewConfig.configuration !== undefined
            ? (viewConfig.configuration as Prisma.InputJsonValue)
            : (view.config as Prisma.InputJsonValue),
      },
    });
  }

  /**
   * Elimina una vista
   */
  static async deleteView(viewId: string, userEmail: string): Promise<void> {
    // Verificamos que la vista existe y pertenece al usuario
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const view = await prisma.view.findUnique({
      where: { id: viewId },
    });

    if (!view) {
      throw new Error("Vista no encontrada");
    }

    if (view.userId !== user.id) {
      throw new Error("No tienes permiso para eliminar esta vista");
    }

    // Eliminamos la vista
    await prisma.view.delete({
      where: { id: viewId },
    });
  }
}
