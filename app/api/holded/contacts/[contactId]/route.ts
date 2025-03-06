import { NextRequest } from "next/server";
import {
  HoldedContact,
  MembershipInfo,
  TrainingInfo,
  ServiceInfo,
} from "@/app/lib/holded/interfaces/contact-types";

// Función para obtener un contacto específico de Holded
async function getContactById(contactId: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://api.holded.com/api/invoicing/v1/contacts/${contactId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          key: apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error al obtener el contacto: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}

// Función para procesar un contacto y añadir información adicional
function processContact(contact: HoldedContact) {
  // Calcular la antigüedad (tenure) basada en la fecha de creación
  let tenure = "new"; // Por defecto, un contacto nuevo
  if (contact.created_at) {
    const createdDate = new Date(Number(contact.created_at) * 1000); // Convertir timestamp a fecha
    const now = new Date();
    const monthsDiff =
      (now.getFullYear() - createdDate.getFullYear()) * 12 +
      now.getMonth() -
      createdDate.getMonth();

    if (monthsDiff >= 24) {
      tenure = "legend"; // Más de 2 años
    } else if (monthsDiff >= 12) {
      tenure = "loyal"; // Entre 1 y 2 años
    } else if (monthsDiff >= 3) {
      tenure = "onboarding"; // Entre 3 meses y 1 año
    }
  }

  // Extraer membresías de los campos personalizados
  let memberships: MembershipInfo[] = [];
  try {
    if (contact.customFields && contact.customFields.memberships) {
      const membershipData =
        typeof contact.customFields.memberships === "string"
          ? JSON.parse(contact.customFields.memberships)
          : contact.customFields.memberships;

      if (Array.isArray(membershipData)) {
        memberships = membershipData.map((membership) => {
          // Asegurarse de que cada membresía tenga los campos necesarios
          return {
            id:
              membership.id ||
              `membership-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            name: membership.name || "Membresía sin nombre",
            status: membership.status || "no-status",
            startDate: membership.startDate || "N/A",
            endDate: membership.endDate || "N/A",
            type: membership.type || "unknown",
          };
        });
      }
    }
  } catch (error) {
    console.error("Error al procesar membresías:", error);
  }

  // Extraer trainings de los campos personalizados
  let trainings: TrainingInfo[] = [];
  try {
    if (contact.customFields && contact.customFields.trainings) {
      const trainingData =
        typeof contact.customFields.trainings === "string"
          ? JSON.parse(contact.customFields.trainings)
          : contact.customFields.trainings;

      if (Array.isArray(trainingData)) {
        trainings = trainingData.map((training) => {
          // Asegurarse de que cada formación tenga los campos necesarios
          return {
            id:
              training.id ||
              `training-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            name: training.name || "Formación sin nombre",
            status: training.status || "no-status",
            startDate: training.startDate || "N/A",
            endDate: training.endDate || "N/A",
            extendedEndDate: training.extendedEndDate || null,
          };
        });
      }
    }
  } catch (error) {
    console.error("Error al procesar formaciones:", error);
  }

  // Extraer servicios de los campos personalizados
  let services: ServiceInfo[] = [];
  try {
    if (contact.customFields && contact.customFields.services) {
      const serviceData =
        typeof contact.customFields.services === "string"
          ? JSON.parse(contact.customFields.services)
          : contact.customFields.services;

      if (Array.isArray(serviceData)) {
        services = serviceData.map((service) => {
          // Asegurarse de que cada servicio tenga los campos necesarios
          return {
            id:
              service.id ||
              `service-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            name: service.name || "Servicio sin nombre",
            status: service.status || "no-status",
            startDate: service.startDate || "N/A",
            endDate: service.endDate || "N/A",
          };
        });
      }
    }
  } catch (error) {
    console.error("Error al procesar servicios:", error);
  }

  // Extraer todos los campos personalizados para mostrarlos
  const customFields = contact.customFields || {};

  // Determinar el estado del contacto
  const status = contact.status || "active"; // Usar el estado existente o "active" por defecto

  // Devolver el contacto procesado con toda la información
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email || "",
    phone: contact.phone || "",
    address: contact.address || "",
    notes: contact.notes || "",
    type: contact.customer_group || contact.type || "",
    createdAt: contact.created_at || "",
    updatedAt: contact.updated_at || "",
    status,
    tenure,
    memberships, // Siempre incluir, incluso si está vacío
    trainings, // Siempre incluir, incluso si está vacío
    services, // Siempre incluir, incluso si está vacío
    customFields,
    // Incluir todos los demás campos del contacto original
    ...Object.entries(contact)
      .filter(
        ([key]) =>
          ![
            "id",
            "name",
            "email",
            "phone",
            "address",
            "notes",
            "customer_group",
            "type",
            "created_at",
            "updated_at",
            "status",
            "customFields",
          ].includes(key)
      )
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
  };
}

export async function GET(
  request: NextRequest,
  context: { params: { contactId: string } }
) {
  try {
    // Corregir el error esperando params
    const { params } = context;
    const contactId = params.contactId;

    // Obtener la API key de las variables de entorno
    const apiKey = process.env.HOLDED_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "API key de Holded no configurada" },
        { status: 500 }
      );
    }

    // Obtener el contacto de Holded
    const contact = await getContactById(contactId, apiKey);
    if (!contact) {
      return Response.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    // Procesar el contacto para obtener información adicional
    const processedContact = processContact(contact);

    return Response.json(processedContact);
  } catch (error) {
    console.error("Error al obtener detalles del contacto:", error);
    return Response.json(
      { error: "Error al obtener detalles del contacto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { contactId: string } }
) {
  try {
    // Corregir el error esperando params
    const { params } = context;
    const contactId = params.contactId;

    // Obtener la API key de las variables de entorno
    const apiKey = process.env.HOLDED_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "API key de Holded no configurada" },
        { status: 500 }
      );
    }

    // Obtener los datos del cuerpo de la solicitud
    const data = await request.json();

    // Validar que se proporcionaron datos
    if (!data) {
      return Response.json(
        { error: "No se proporcionaron datos para actualizar" },
        { status: 400 }
      );
    }

    // Obtener el contacto actual
    const currentContact = await getContactById(contactId, apiKey);
    if (!currentContact) {
      return Response.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el contacto con los nuevos datos
    // Aquí iría la lógica para actualizar el contacto en Holded
    // Por ahora, simulamos una actualización exitosa
    const updatedContact = {
      ...currentContact,
      ...data,
      updated_at: Date.now() / 1000, // Timestamp actual en segundos
    };

    // Procesar el contacto actualizado
    const processedContact = processContact(updatedContact);

    return Response.json(processedContact);
  } catch (error) {
    console.error("Error al actualizar el contacto:", error);
    return Response.json(
      { error: "Error al actualizar el contacto" },
      { status: 500 }
    );
  }
}
