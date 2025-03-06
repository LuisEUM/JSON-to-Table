import { HoldedContact } from "../interfaces/contact-types";

// Estructura para almacenar contactos en caché
interface ContactsCache {
  contacts: HoldedContact[];
  timestamp: number;
  // Añadir caché por tipo
  contactsByType: Record<string, HoldedContact[]>;
}

// Caché en memoria para contactos
let contactsCache: ContactsCache = {
  contacts: [],
  timestamp: 0,
  contactsByType: {},
};

// Tiempo de expiración del caché en milisegundos (5 minutos)
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

/**
 * Obtiene todos los contactos de Holded con paginación
 *
 * @param apiKey - Clave de API de Holded (opcional)
 * @param forceRefresh - Forzar actualización del caché
 * @param type - Tipo de contacto a filtrar (client, creditor, debtor, lead, supplier)
 * @returns Lista de contactos de Holded
 */
export async function getContacts(
  apiKey?: string,
  forceRefresh = false,
  type?: string
): Promise<HoldedContact[]> {
  // Usar la clave de API proporcionada o la del entorno
  const holdedApiKey = apiKey || process.env.HOLDED_API_KEY;

  if (!holdedApiKey) {
    throw new Error("No se ha proporcionado una clave de API de Holded");
  }

  // Si el tipo es "all", tratarlo como undefined para obtener todos los contactos
  if (type === "all") {
    console.log("Tipo 'all' detectado: obteniendo todos los contactos");
    type = undefined;
  }

  // Verificar si hay datos en caché válidos y no se fuerza actualización
  const now = Date.now();
  const isCacheValid =
    !forceRefresh &&
    contactsCache.contacts.length > 0 &&
    now - contactsCache.timestamp < CACHE_EXPIRY_TIME;

  // Si tenemos caché válido y se solicita un tipo específico
  if (isCacheValid && type && contactsCache.contactsByType[type]) {
    console.log(
      `Usando contactos en caché para tipo '${type}'. Total:`,
      contactsCache.contactsByType[type].length
    );
    return contactsCache.contactsByType[type];
  }

  // Si tenemos caché válido y no se solicita un tipo específico
  if (isCacheValid && !type) {
    console.log(
      "Usando todos los contactos en caché. Total:",
      contactsCache.contacts.length
    );
    return contactsCache.contacts;
  }

  console.log("Obteniendo contactos frescos de la API de Holded...");

  let allContacts: HoldedContact[] = [];
  let page = 1;
  const limit = 100; // Límite máximo de la API de Holded
  let hasMoreContacts = true;

  // Iterar mientras haya más páginas de contactos
  while (hasMoreContacts) {
    // Construir URL con paginación
    let url = `https://api.holded.com/api/invoicing/v1/contacts?page=${page}&limit=${limit}`;

    // Añadir filtro de tipo si se especifica
    if (type) {
      url += `&type=${type}`;
    }

    // Realizar petición a la API de Holded
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        key: holdedApiKey,
      },
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      try {
        await response.json(); // Consumir el cuerpo de la respuesta
      } catch {
        // Ignorar errores de parsing
      }
      throw new Error(
        `Error al obtener contactos (${response.status}: ${response.statusText})`
      );
    }

    // Procesar contactos de esta página
    const contacts = await response.json();

    if (Array.isArray(contacts) && contacts.length > 0) {
      // Añadir contactos de esta página al resultado acumulado
      allContacts = [...allContacts, ...contacts];
      console.log(
        `Obtenidos ${contacts.length} contactos de la página ${page}${
          type ? ` (tipo: ${type})` : ""
        }`
      );
      page++;

      // Si recibimos menos contactos que el límite, hemos terminado
      if (contacts.length < limit) {
        hasMoreContacts = false;
      }
    } else {
      // No hay más contactos o formato inesperado
      hasMoreContacts = false;
    }
  }

  console.log(
    `Total de contactos obtenidos: ${allContacts.length}${
      type ? ` (tipo: ${type})` : ""
    }`
  );

  // Si no estamos filtrando, actualizar el caché principal
  if (!type) {
    contactsCache.contacts = allContacts;
    contactsCache.timestamp = now;

    // Actualizar también el caché por tipo
    const contactsByType: Record<string, HoldedContact[]> = {};

    // Agrupar contactos por tipo
    allContacts.forEach((contact) => {
      const contactType = contact.type as string;
      if (contactType) {
        if (!contactsByType[contactType]) {
          contactsByType[contactType] = [];
        }
        contactsByType[contactType].push(contact);
      }
    });

    contactsCache.contactsByType = contactsByType;
  }
  // Si estamos filtrando, solo actualizar el caché para ese tipo
  else if (isCacheValid) {
    contactsCache.contactsByType[type] = allContacts;
  }
  // Si el caché no es válido y estamos filtrando, actualizar todo
  else {
    contactsCache = {
      contacts: allContacts,
      timestamp: now,
      contactsByType: { [type]: allContacts },
    };
  }

  return allContacts;
}

/**
 * Obtiene un contacto específico por su ID
 *
 * @param contactId - ID del contacto a obtener
 * @param apiKey - Clave de API de Holded (opcional)
 * @returns Contacto encontrado o null si no existe
 */
export async function getContactById(
  contactId: string,
  apiKey?: string
): Promise<HoldedContact | null> {
  // Intentar obtener de caché primero
  const now = Date.now();
  if (
    contactsCache.contacts.length > 0 &&
    now - contactsCache.timestamp < CACHE_EXPIRY_TIME
  ) {
    const cachedContact = contactsCache.contacts.find(
      (contact) => contact.id === contactId
    );
    if (cachedContact) {
      return cachedContact;
    }
  }

  // Si no está en caché o caché expirado, obtener de la API
  const holdedApiKey = apiKey || process.env.HOLDED_API_KEY;

  if (!holdedApiKey) {
    throw new Error("No se ha proporcionado una clave de API de Holded");
  }

  const url = `https://api.holded.com/api/invoicing/v1/contacts/${contactId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      key: holdedApiKey,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(
      `Error al obtener contacto (${response.status}: ${response.statusText})`
    );
  }

  return await response.json();
}
