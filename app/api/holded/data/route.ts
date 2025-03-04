import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Función para manejar solicitudes GET a /api/holded/data
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

    // En esta versión, proporcionaremos datos de ejemplo
    // En una implementación real, haríamos la solicitud a la API de Holded

    // Datos de ejemplo para demostración
    const mockData = [
      {
        id: "6595490eb6c3825bd70a1c4d",
        customId: "",
        name: "Silvia Esparza S.l.",
        code: "B31775695",
        vatnumber: "B31775695",
        tradeName: "Silvia Esparza Estilistas",
        email: "silviaesparza@hotmail.com",
        mobile: "",
        phone: "655860750",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: "",
        supplierRecord: 0,
        billAddress: {
          address: "Calle san juan de la cadena 4. trasera",
          city: "Pamplona",
          postalCode: "31008",
          province: "Navarra",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "GROW UP",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "Webinar",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "GROW",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "GUILLERMO",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "ACTIVO",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "PATRICIA",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED11 ABR-JUL25",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "LORENA",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/02/2025",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "https://www.instagram.com/silviaesparzaestilistas/",
          facebook: "",
          twitter: "",
        },
        tags: [],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704282383,
        updatedAt: 1738001102,
        updatedHash: "92bb0c79307b096d1acd2d800f4b1fe1",
      },
      {
        id: "65967f0bdb6bfacf2508c6bd",
        customId: "",
        name: "Pablo Sanchez Taberner",
        code: "24393824R",
        vatnumber: "",
        tradeName: 0,
        email: "pablosancheztaberner@gmail.com",
        mobile: "673770814",
        phone: "",
        type: "creditor",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: "",
        supplierRecord: {
          num: 41000001,
          name: "Pablo Sanchez Taberner",
        },
        billAddress: {
          address: "Carrer Passarell",
          city: "Valencia",
          postalCode: "46117",
          province: "Valencia",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: {
            $oid: "65967f1692107847690376e4",
          },
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: [],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704361739,
        updatedAt: 1735536366,
        updatedHash: "9cff737e82dce5bd2a49f10c84e61746",
      },
      {
        id: "659696af9dcbc6428603893c",
        customId: "",
        name: "Lydia Cañardo",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696af9dcbc6428603893b",
            name: "Lidia Cañardo Ruano",
            job: "",
            phone: "0",
            email: "lydiaestilistassabi@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367791,
        updatedAt: 1704367791,
        updatedHash: "f69d19187ef50f99909eac1f91453e8d",
      },
      {
        id: "659696af9dcbc6428603893b",
        customId: "",
        name: "Lidia Cañardo Ruano",
        code: "73229483J",
        vatnumber: "",
        tradeName: "Lydia Estilistas",
        email: "lydiaestilistassabi@gmail.com",
        mobile: "692001698",
        phone: "0",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "General Villacampa, 2",
          city: "sabiñanigo",
          postalCode: "22600",
          province: "Huesca",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "01/03/2024",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: ["baja"],
        notes: [],
        contactPersons: [
          {
            personId: "659696af9dcbc6428603893c",
            name: "Lydia Cañardo",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367791,
        updatedAt: 1731686147,
        updatedHash: "45154b9eb3394f520477cb0cb04a8c63",
      },
      {
        id: "659696af9dcbc6428603893e",
        customId: "",
        name: "Jessica Arrabalid Doblas",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696af9dcbc6428603893d",
            name: "Jessie arte y estilo",
            job: "",
            phone: 0,
            email: "administracion@jessiearteyestilo.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367791,
        updatedAt: 1704367791,
        updatedHash: "d996cf59d1769e5fa15879c79098ff65",
      },
      {
        id: "659696af9dcbc6428603893d",
        customId: "",
        name: "Jessie arte y estilo",
        code: "26812158T",
        vatnumber: "",
        tradeName: "Jessie arte y estilo",
        email: "administracion@jessiearteyestilo.com",
        mobile: 686534723,
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "Calle Shanti Andia local 1",
          city: "Málaga",
          postalCode: 29006,
          province: "Málaga",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696af9dcbc6428603893e",
            name: "Jessica Arrabalid Doblas",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367791,
        updatedAt: 1704367791,
        updatedHash: "c31c38c7a1095b243e857335b3c6200c",
      },
      {
        id: "659696b09dcbc6428603893f",
        customId: "",
        name: "Isabel Dopico Villegas",
        code: "77298580L",
        vatnumber: "",
        tradeName: "Perruquería Isabel Dopico",
        email: "perruqueria.isabeldopico@gmail.com",
        mobile: "676284022",
        phone: "",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: {
          num: 43000285,
          name: "Isabel Dopico Villegas",
        },
        supplierRecord: 0,
        billAddress: {
          address: "Francesc Masia 16 - Local C",
          city: "Vilafranca del Penedès",
          postalCode: "8720",
          province: "Barcelona",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "01/12/2022",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "Webinar",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "GOLD",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "PABLO",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "ACTIVO",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "PATRICIA",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "PEDRO",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED05 ENE-MAR23",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "ED03 ENE-MAY24",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "ED03 SEP-DIC23",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "PEDRO",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "31/01/2025",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/02/2023",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "NOEMÍ",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "31/01/2025",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "webinar",
          "ve_res_pablo",
          "gold",
          "bi_res_patricia",
          "activo",
          "mktsalon",
          "ibm05",
          "starclub03",
          "salonexperience03",
          "scaling05",
          "socialmkt",
        ],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1726034737,
        updatedHash: "181b4bbb678fa57e8f521ca1709f942f",
      },
      {
        id: "659696b09dcbc64286038942",
        customId: "",
        name: "Moisés Sánchez Sepúlveda",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038941",
            name: "Moisés Sánchez Sepúlveda",
            job: "",
            phone: 0,
            email: "moises.estil@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "80ee2813298aaca10feaccb8e20260bb",
      },
      {
        id: "659696b09dcbc64286038941",
        customId: "",
        name: "Moisés Sánchez Sepúlveda",
        code: "30531718T",
        vatnumber: "",
        tradeName: "MOISES PELUQUERÍA Y ESTÉTICA",
        email: "moises.estil@gmail.com",
        mobile: 659149144,
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "Av Ollerias 36 local esquina",
          city: "Córdoba",
          postalCode: 14001,
          province: "Córdoba",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038942",
            name: "Moisés Sánchez Sepúlveda",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "473da112558985222e457ed7e70928c8",
      },
      {
        id: "659696b09dcbc64286038944",
        customId: "",
        name: "Silvia Urkijo Plaza",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038943",
            name: "Silvia Urkijo Plaza",
            job: "",
            phone: 0,
            email: "silviaurkijo@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "2c6783b21313f1347db546ec3e8aca66",
      },
      {
        id: "659696b09dcbc64286038943",
        customId: "",
        name: "Silvia Urkijo Plaza",
        code: "45817980W",
        vatnumber: "",
        tradeName: "RITUAL",
        email: "silviaurkijo@gmail.com",
        mobile: 622823868,
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "C/ Autonomía, 12",
          city: "Baracaldo",
          postalCode: 48902,
          province: "Vizcaya",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "31/01/2024",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "ED02 ENE-MAY23",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "ED03 SEP-DIC23",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: ["baja", "starclub03", "salonexperience02"],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038944",
            name: "Silvia Urkijo Plaza",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1720614792,
        updatedHash: "2d0b046040546059bff0cf664e581397",
      },
      {
        id: "659696b09dcbc64286038946",
        customId: "",
        name: "Mara Vazquez Mercador",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038945",
            name: "Mara Vazquez Mercador",
            job: "",
            phone: 0,
            email: "taxi196@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "094bcfe0666036a2675b29783c1239da",
      },
      {
        id: "659696b09dcbc64286038945",
        customId: "",
        name: "Mara Vazquez Mercador",
        code: "",
        vatnumber: "",
        tradeName: "MARA ESTILISTAS",
        email: "taxi196@gmail.com",
        mobile: "607 27 57 57",
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "O pombal ,56 2c",
          city: "Oleiros",
          postalCode: 15172,
          province: "La Coruña",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038946",
            name: "Mara Vazquez Mercador",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "134883ffc61bbb11a1c44565a458c5f2",
      },
      {
        id: "659696b09dcbc64286038948",
        customId: "",
        name: "Cristina Rallo Flos",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038947",
            name: "Cristina Rallo Flos",
            job: "",
            phone: "",
            email: "cristinarallo1963@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "e2b3087deb8813b9ad3a42a195cf0851",
      },
      {
        id: "659696b09dcbc64286038947",
        customId: "",
        name: "Cristina Rallo Flos",
        code: "E12518114",
        vatnumber: "",
        tradeName: "PERRUQUERIA CRISTINA",
        email: "cristinarallo1963@gmail.com",
        mobile: "682 27 67 03",
        phone: "",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: "",
        supplierRecord: 0,
        billAddress: {
          address: "C / César Cataldo 53 bajos (perruqueria)",
          city: "benicarló",
          postalCode: 12580,
          province: "Castellón",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "29/12/2023",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: ["baja"],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038948",
            name: "Cristina Rallo Flos",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1717590950,
        updatedHash: "bbc778254bf94f9ce16953536ff8d053",
      },
      {
        id: "659696b09dcbc6428603894a",
        customId: "",
        name: "CLARA RIVERA VELIZ",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038949",
            name: "CLARA RIVERA VELIZ",
            job: "",
            phone: 948365882,
            email: "naturbelpeluqueriayestetica@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "7ba3c8cf4d44373ffb9faa9809bd160b",
      },
      {
        id: "659696b09dcbc64286038949",
        customId: "",
        name: "CLARA RIVERA VELIZ",
        code: "73125343V",
        vatnumber: "",
        tradeName: "NATURBEL ESTILISTAS",
        email: "naturbelpeluqueriayestetica@gmail.com",
        mobile: 636962242,
        phone: 948365882,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: {
          num: 43000191,
          name: "CLARA RIVERA VELIZ",
        },
        supplierRecord: 0,
        billAddress: {
          address: "Grupo Rinaldi 1",
          city: "Pamplona",
          postalCode: 31007,
          province: "Navarra",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "JORGE",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "29/05/2024",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "PATRICIA",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "ED01 2023",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED01 ENE-ABR21",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "ED01 SEP-DIC21",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "31/05/2024",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/01/2024",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "ve_res_jorge",
          "bi_res_patricia",
          "baja",
          "ibm01",
          "salonexperience01",
          "menuservicios01",
        ],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc6428603894a",
            name: "CLARA RIVERA VELIZ",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1719236566,
        updatedHash: "3c4b8f4189fa465cc8cf2d6bdeb8c77d",
      },
      {
        id: "659696b09dcbc6428603894b",
        customId: "",
        name: "Alma Rivas Escribano",
        code: "73244364J",
        vatnumber: "",
        tradeName: "SALÓN MENTA",
        email: "mentaalma@hotmail.com",
        mobile: 616998696,
        phone: 876285713,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: {
          num: 43000192,
          name: "Alma Rivas Escribano",
        },
        supplierRecord: 0,
        billAddress: {
          address: "Pedro María Ric 38",
          city: "Zaragoza",
          postalCode: 50008,
          province: "Zaragoza",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "01/06/2022",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "03/06/2024",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "03/06/2024",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "ED03 ABR24",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "ED01 SEP-DIC21",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "26/03/2024",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/06/2022",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "NOEMÍ",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "baja",
          "hiperventas03",
          "salonexperience01",
        ],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1717754029,
        updatedHash: "9e3bc7552473606f0122480be5aa8f41",
      },
      {
        id: "659696b09dcbc6428603894d",
        customId: "",
        name: "Audrey Lange Martinez",
        code: "44662887S",
        vatnumber: "",
        tradeName: "Peluqueria Audrey",
        email: "peluqueriaaudrey@gmail.com",
        mobile: "667900179",
        phone: "",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: {
          num: 43000685,
          name: "Audrey Lange Martinez",
        },
        supplierRecord: 0,
        billAddress: {
          address: "Calle dos remedios 1 bajo",
          city: "Ourense",
          postalCode: "32002",
          province: "Ourense",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "25/09/2023",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "Webinar",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "GUILLERMO",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "ACTIVO",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "PATRICIA",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "ED00 ANTIGUOS",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "ED02 OCT23",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED09 SEP-DIC24",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "ED02 ABR-MAY24",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "31/08/2025",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "01/09/2024",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "LORENA",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/02/2024",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "webinar",
          "ve_res_patricia",
          "impulsa",
          "bi_res_patricia",
          "activo",
          "mktsalon",
          "startmkt02",
          "ibm09",
          "scaling02",
          "inp00",
          "insideclub",
        ],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1724344763,
        updatedHash: "e49be541aca29e8e71d648d03b8e3631",
      },
      {
        id: "659696b09dcbc64286038950",
        customId: "",
        name: "MARISOL",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc6428603894f",
            name: "MARLAMO, SLU",
            job: "",
            phone: "926 514 068",
            email: "sol_pelu@hotmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "c5a576aada045fc4111caa80146871e1",
      },
      {
        id: "659696b09dcbc6428603894f",
        customId: "",
        name: "MARLAMO, SLU",
        code: "B13434931",
        vatnumber: "",
        tradeName: "Peluquería Blume",
        email: "sol_pelu@hotmail.com",
        mobile: 678409007,
        phone: "926 514 068",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "AVD DON ANTONIO HUERTAS, 17",
          city: "Tomelloso",
          postalCode: 13700,
          province: "Ciudad Real",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038950",
            name: "MARISOL",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "8b64ec86de787ea9092239292558b9dd",
      },
      {
        id: "659696b09dcbc64286038951",
        customId: "",
        name: "Abdelilah Lattach",
        code: "10236865W",
        vatnumber: "",
        tradeName: "DOBLE R",
        email: "raquelrs31@gmail.com",
        mobile: "638 38 72 08",
        phone: "0",
        type: "debtor",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: {
          num: 43000304,
          name: "Abdelilah Lattach",
        },
        supplierRecord: 0,
        billAddress: {
          address: "Calle Doctor Joan Miró 10B 2 2",
          city: "Santa Perpetua de moguda",
          postalCode: "8130",
          province: "Barcelona",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED01 ENE-ABR21",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "ED01 SEP-DIC21",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "ED01 SEP-DIC21",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: ["ibm01", "starclub01", "salonexperience01"],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1738052728,
        updatedHash: "669d49ff2931086d2d02224b69a04748",
      },
      {
        id: "659696b09dcbc64286038954",
        customId: "",
        name: "Maria José Sánchez Carmona",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "befe52d9151f072399ab014c9284daba",
      },
      {
        id: "659696b09dcbc64286038953",
        customId: "",
        name: "Maria Jose Sanchez Carmona",
        code: "43722877S",
        vatnumber: "",
        tradeName: "Head Colors",
        email: "Mylsmsc@gmail.com",
        mobile: "660489634",
        phone: "0",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: "",
        supplierRecord: 0,
        billAddress: {
          address: "Julio cesar N6 5D",
          city: "Lérida",
          postalCode: "25003",
          province: "Lérida",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "22/08/2023",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "Webinar",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "GOLD",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "JORGE",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "ACTIVO",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "GUILLERMO",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED01 ENE-ABR21",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "LORENA",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/09/2023",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          instagram: "https://www.instagram.com/head_colors/",
          google: "",
          linkedin: "",
          pinterest: "",
          foursquare: "",
          youtube: "",
          vimeo: "",
          wordpress: "",
          website: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "webinar",
          "ve_res_jorge",
          "gold",
          "bi_res_guillermo",
          "activo",
          "mktsalon",
          "ibm01",
        ],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1738051983,
        updatedHash: "7fe11c58bcf4137f16db751f00763972",
      },
      {
        id: "659696b09dcbc64286038956",
        customId: "",
        name: "Celia López Gutiérrez",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038955",
            name: "Celia López Gutiérrez",
            job: "",
            phone: 0,
            email: "cl0654062@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "60c3bc452a01bee7605eb39f8d26153a",
      },
      {
        id: "659696b09dcbc64286038955",
        customId: "",
        name: "Celia López Gutiérrez",
        code: "46699549G",
        vatnumber: "",
        tradeName: "XTREMA2 perruqueria",
        email: "cl0654062@gmail.com",
        mobile: 675252479,
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: 0,
          city: "Badalona",
          postalCode: 8917,
          province: "Barcelona",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038956",
            name: "Celia López Gutiérrez",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "616819ddd1937eadf9e4c893f29d5460",
      },
      {
        id: "659696b09dcbc64286038958",
        customId: "",
        name: "Irene",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038957",
            name: "Irene Hair Salon, S.L",
            job: "",
            phone: 937515705,
            email: "facturacion@irenehairsalon.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "2cd619637b2ca77e096679da71a6c468",
      },
      {
        id: "659696b09dcbc64286038957",
        customId: "",
        name: "Irene Hair Salon, S.L",
        code: "B44760676",
        vatnumber: "",
        tradeName: "IreNe. Peluqueria y Estetica.",
        email: "facturacion@irenehairsalon.com",
        mobile: 670092690,
        phone: 937515705,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "Esperanza N3",
          city: "Premia de Mar",
          postalCode: 8330,
          province: "Barcelona",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038958",
            name: "Irene",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "a8595c82b0a1154302e9c5a999e7c44f",
      },
      {
        id: "659696b09dcbc6428603895a",
        customId: "",
        name: "Asunción Igual Ruiz",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038959",
            name: "Asunción Igual Ruiz",
            job: "",
            phone: 0,
            email: "petrer16@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "e4308d96289ceedcdfaa41f00697262e",
      },
      {
        id: "659696b09dcbc64286038959",
        customId: "",
        name: "Asunción Igual Ruiz",
        code: "22135295A",
        vatnumber: "",
        tradeName: "SUNY ESTILISTAS",
        email: "petrer16@gmail.com",
        mobile: 656649037,
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: {
          num: 43000387,
          name: "Asunción Igual Ruiz",
        },
        supplierRecord: 0,
        billAddress: {
          address: "C/ Principe de Asturias, 11",
          city: "Petrer",
          postalCode: 3610,
          province: "Alicante",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED05 ENE-MAR23",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: ["baja", "ibm05"],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc6428603895a",
            name: "Asunción Igual Ruiz",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1715018376,
        updatedHash: "508d2877d230c484a9acbe74c80265f4",
      },
      {
        id: "659696b09dcbc6428603895c",
        customId: "",
        name: "Soledad García Plaza",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc6428603895b",
            name: "Soledad García Plaza",
            job: "",
            phone: 0,
            email: "soledadgp@live.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "6fc01131fe4a5c87ddd73cbb694ca6e1",
      },
      {
        id: "659696b09dcbc6428603895b",
        customId: "",
        name: "Soledad García Plaza",
        code: "08850205N",
        vatnumber: "",
        tradeName: "Escena Beauty",
        email: "soledadgp@live.com",
        mobile: 687957669,
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "C/Jacinta García Hernández 4A",
          city: "Badajoz",
          postalCode: 6011,
          province: "Badajoz",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc6428603895c",
            name: "Soledad García Plaza",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1704367792,
        updatedHash: "fca52d0cc089bebd67b2878378a0c5bf",
      },
      {
        id: "659696b09dcbc6428603895d",
        customId: "",
        name: "Begoña Ruiz Llanos",
        code: "16571482M",
        vatnumber: "",
        tradeName: "Begoña Ruiz Peluquería",
        email: "begoruizpeluqueria@gmail.com",
        mobile: "699 92 59 25",
        phone: "941 23 57 84",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: {
          num: 43000324,
          name: "Begoña Ruiz Llanos",
        },
        supplierRecord: 0,
        billAddress: {
          address: "Calle Vara del rey 33 bj",
          city: "Logroño",
          postalCode: 26002,
          province: "La Rioja",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "01/01/2021",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "Webinar",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "PABLO",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "30/11/2024",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "VIRGINIA",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "https://www.facebook.com/begonaruizpeluqueria",
          twitter: "",
          instagram: "https://www.instagram.com/begonaruizpeluqueria/",
          google: "",
          linkedin: "",
          pinterest: "",
          foursquare: "",
          youtube: "",
          vimeo: "",
          wordpress: "",
          website: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "webinar",
          "ve_res_pablo",
          "activo",
          "socialmkt",
        ],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1715021489,
        updatedHash: "76a010dfc08edaba280fc5a3690049a0",
      },
      {
        id: "659696b09dcbc6428603895f",
        customId: "",
        name: "Amaia Martin Morillo",
        code: "1605395A",
        vatnumber: "",
        tradeName: "PELUQUERIA AMAIA MARTIN",
        email: "peluqueria.amaia.martin@gmail.com",
        mobile: 635707377,
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: "",
        supplierRecord: 0,
        billAddress: {
          address: "c/ barria, lonja 2",
          city: "Getxo",
          postalCode: 48930,
          province: "Vizcaya",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: ["baja"],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367792,
        updatedAt: 1715018393,
        updatedHash: "f06b4acdac9ce4230b6d6bd147541292",
      },
      {
        id: "659696b09dcbc64286038962",
        customId: "",
        name: "Rosa isabel",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038961",
            name: "Rosa Isabel Menendez de Antón y Otro C.B",
            job: "",
            phone: "985 33 79 63",
            email: "rosa@medeaestilistas.es",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367793,
        updatedAt: 1704367793,
        updatedHash: "2ac9ee062ba9b1afb83883dc998e845f",
      },
      {
        id: "659696b09dcbc64286038961",
        customId: "",
        name: "Rosa Isabel Menendez de Antón y Otro C.B",
        code: "E33745837",
        vatnumber: "",
        tradeName: "MEDEA ESTILISTAS",
        email: "rosa@medeaestilistas.es",
        mobile: "667406289",
        phone: "985 33 79 63",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "Anselmo Solar, 31",
          city: "Gijón",
          postalCode: "33204",
          province: "Asturias",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "01/03/2023",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "Webinar",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "SILVER",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "JORGE",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "05/02/2025",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "PATRICIA",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED06 ABR-JUL23",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/03/2023",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          instagram: "https://www.instagram.com/medeaestilistas/",
          google: "",
          linkedin: "",
          pinterest: "",
          foursquare: "",
          youtube: "",
          vimeo: "",
          wordpress: "",
          website: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "webinar",
          "ve_res_jorge",
          "silver",
          "bi_res_patricia",
          "activo",
          "mktsalon",
          "ibm06",
          "insideclub_antiguo",
        ],
        notes: [],
        contactPersons: [
          {
            personId: "659696b09dcbc64286038962",
            name: "Rosa isabel",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367793,
        updatedAt: 1724345956,
        updatedHash: "fc2bd49705e79a4f4ce1348ac96e0ef2",
      },
      {
        id: "659696b19dcbc64286038963",
        customId: "",
        name: "María Yolanda Moreno Tomás",
        code: "25437420H",
        vatnumber: "",
        tradeName: "Yolanda Moreno Peluqueros",
        email: "ympeluqueros@gmail.com",
        mobile: "655767184",
        phone: "976280430",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: {
          num: 43000646,
          name: "Maria Yolanda Moreno Tomas",
        },
        supplierRecord: 0,
        billAddress: {
          address: "Avenida Pablo Gargallo, 1-3",
          city: "Zaragoza",
          postalCode: "50003",
          province: "Zaragoza",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "01/01/2021",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "2",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "Webinar",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "DIAMOND",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "PABLO",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "ACTIVO",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "01/01/2021",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "JESÚS",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "ED04 MAY-SEP24",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED01 ENE-ABR21, ED09 SEP-DIC24",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "ED01 SEP-DIC21",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "ED01 ENE-MAR24",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "ED01 SEP-DIC21",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "01/09/2021",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "03/10/2022",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "JESÚS",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/02/2021",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "01/12/2022",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "NOEMÍ",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "01/01/2024",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "https://www.facebook.com/profile.php?id=100091584061835",
          twitter: "",
          instagram: "https://www.instagram.com/yolanda_moreno_peluqueros/",
          google: "",
          linkedin: "",
          pinterest: "",
          foursquare: "",
          youtube: "",
          vimeo: "",
          wordpress: "https://yolandamorenopeluqueros.es/wp-admin",
          website: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "webinar",
          "ve_res_pablo",
          "diamond",
          "activo",
          "mktsalon",
          "teams",
          "hiperventas04",
          "ibm01",
          "starclub01",
          "salonexperience01",
          "scaling01",
          "gestiondirectiva",
          "socialmkt",
          "mktdirectoweb",
          "cm",
          "insideclub_antiguo",
        ],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367793,
        updatedAt: 1727279640,
        updatedHash: "8c73aa31526a6a8846f635ea1f781a13",
      },
      {
        id: "659696b19dcbc64286038965",
        customId: "",
        name: "Lourdes Porras Gómez",
        code: "30211556 K",
        vatnumber: "",
        tradeName: "Personal by Lourdes",
        email: "lourdespersonal77@gmail.com",
        mobile: "669478500",
        phone: "",
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: {
          num: 43000619,
          name: "Lourdes Porras Gómez",
        },
        supplierRecord: 0,
        billAddress: {
          address: "Carrer Sants, 291",
          city: "Barcelona",
          postalCode: "08028",
          province: "Barcelona",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "01/01/2021",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "1",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "Webinar",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "PABLO",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "ACTIVO",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "01/01/2021",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "JESÚS",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "LORENA",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/02/2021",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "NOEMÍ",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "webinar",
          "ve_res_pablo",
          "activo",
          "mktsalon",
          "socialmkt",
          "cm",
        ],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367793,
        updatedAt: 1728977994,
        updatedHash: "74213f25fcc211c9ceb0e1a947f056de",
      },
      {
        id: "659696b19dcbc64286038967",
        customId: "",
        name: "Raul Santana",
        code: "48349071N",
        vatnumber: "",
        tradeName: "Noir Salon",
        email: "comunicacion.noir@gmail.com",
        mobile: 661344442,
        phone: 0,
        type: "debtor",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "C.C. Garden, Av. Santander, 25, Local 42",
          city: "Alicante (Alacant)",
          postalCode: 3540,
          province: "Alicante",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "STANDBY",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: ["standby"],
        notes: [],
        contactPersons: [],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367793,
        updatedAt: 1723048764,
        updatedHash: "683e7384375926437daa18fc238b7e06",
      },
      {
        id: "659696b19dcbc6428603896a",
        customId: "",
        name: "Cristina Cabrera Morales",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b19dcbc64286038969",
            name: "Cristina Cabrera Morales",
            job: "",
            phone: 0,
            email: "zonadetall@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367793,
        updatedAt: 1704367793,
        updatedHash: "91e5176f3893d883cbdf64147a650486",
      },
      {
        id: "659696b19dcbc64286038969",
        customId: "",
        name: "Cristina Cabrera Morales",
        code: "43442639D",
        vatnumber: "",
        tradeName: "ZONA DE TALL",
        email: "zonadetall@gmail.com",
        mobile: 661234670,
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "Carrer de Rogent, 77",
          city: "Barcelona",
          postalCode: 8026,
          province: "Barcelona",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b19dcbc6428603896a",
            name: "Cristina Cabrera Morales",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367793,
        updatedAt: 1704367793,
        updatedHash: "8f950d6a2f75fb4eda25842e14ea3735",
      },
      {
        id: "659696b19dcbc6428603896c",
        customId: "",
        name: "Marian Balaguer",
        code: "",
        vatnumber: "",
        tradeName: 0,
        email: "",
        mobile: "",
        phone: "",
        type: "",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: 0,
        supplierRecord: 0,
        billAddress: {
          address: "",
          city: "",
          postalCode: "",
          province: "",
          country: "",
          countryCode: null,
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "no",
        },
        socialNetworks: {
          facebook: "",
          twitter: "",
          website: "",
        },
        tags: [],
        notes: [],
        contactPersons: [
          {
            personId: "659696b19dcbc6428603896b",
            name: "Marian Balaguer",
            job: "",
            phone: 0,
            email: "germanesbaila@gmail.com",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 1,
        createdAt: 1704367793,
        updatedAt: 1704367793,
        updatedHash: "7aa149304bd0978c6694f1f2ce2e9df6",
      },
      {
        id: "659696b19dcbc6428603896b",
        customId: "",
        name: "Marian Balaguer",
        code: "B43396217",
        vatnumber: "",
        tradeName: "GERMANES BAILA",
        email: "germanesbaila@gmail.com",
        mobile: 660785467,
        phone: 0,
        type: "client",
        iban: "",
        swift: "",
        groupId: "",
        clientRecord: "",
        supplierRecord: 0,
        billAddress: {
          address: "SAN ISIDRE 7 c.c. Hort del Rei local 25",
          city: "Sant carles de la ràpita",
          postalCode: 43540,
          province: "Tarragona",
          country: "España",
          countryCode: "ES",
          info: "",
        },
        customFields: [
          {
            field: "CLIENTE VENTAS - Etapa del Manager",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Etapa del Salón",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Facturación Promedio Mensual",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Inicio",
            value: "01/01/2021",
          },
          {
            field: "CLIENTE VENTAS - Nº de Colaboradores",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Nº de Salones",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Origen del Lead",
            value: "Webinar",
          },
          {
            field: "CLIENTE VENTAS - Plan de Crecimiento 360º",
            value: "DIAMOND",
          },
          {
            field: "CLIENTE VENTAS - Renovación",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable",
            value: "PABLO",
          },
          {
            field: "CLIENTE INSIDERS - Estado del Cliente",
            value: "BAJA",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin",
            value: "25/05/2024",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Fin de Servicios Activos",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Fecha de Standby",
            value: "",
          },
          {
            field: "CLIENTE VENTAS - Responsable de Sesión de Bienvenida",
            value: "",
          },
          {
            field: "CLIENTE INSIDERS - Responsable de Sesión de Bienvenida",
            value: "PATRICIA",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA C&M - Responsable",
            value: "LORENA",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Inicio",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Fecha de Fin",
            value: "",
          },
          {
            field: "CONSULTORÍA MENTORING - Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN 4 SECRETOS IMPARABLES - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN INP - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MENÚ DE SERVICIOS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN TALLER PRESENCIAL - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN SALÓN HIPERVENTAS - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN START MARKETING - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER IBM - Edición",
            value: "ED01 ENE-ABR21",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SALÓN EXPERIENCE - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER SCALING-S - Edición",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Consultor Responsable",
            value: "",
          },
          {
            field: "FORMACIÓN MÁSTER STAR CLUB - Edición",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA INSIDE CLUB - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA GESTIÓN DIRECTIVA - Fecha de Inicio",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Consultor Responsable",
            value: "",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Fin",
            value: "25/05/2024",
          },
          {
            field: "MEMBRESÍA MARKETING SALÓN - Fecha de Inicio",
            value: "01/01/2021",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Fin",
            value: "",
          },
          {
            field: "MEMBRESÍA TEAMS - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO AGENCIA - Responsable",
            value: "BÁRBARA",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Fin",
            value: "25/05/2024",
          },
          {
            field: "SERVICIO MKT DIRECTO + WEB MKT - Fecha de Inicio",
            value: "01/01/2021",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Fin",
            value: "",
          },
          {
            field: "SERVICIO SOCIAL MKT - Fecha de Inicio",
            value: "",
          },
          {
            field: "SERVICIO FUNNEL MKT - Responsable",
            value: "",
          },
        ],
        defaults: {
          salesChannel: 0,
          expensesAccount: 0,
          dueDays: 0,
          paymentDay: 0,
          paymentMethod: 0,
          discount: 0,
          language: "es",
          currency: "eur",
          salesTax: [],
          purchasesTax: [],
          accumulateInForm347: "yes",
        },
        socialNetworks: {
          website: "",
          facebook: "",
          twitter: "",
        },
        tags: [
          "ve_fdi_enero2021",
          "webinar",
          "ve_res_pablo",
          "diamond",
          "bi_res_patricia",
          "baja",
          "ibm01",
        ],
        notes: [
          {
            noteId: "65ce81b94a0d897a930507ea",
            name: "ACCESOS",
            description:
              "https://germanesbaila.com/wp-admin \nUsuario: germanesbaila\tContraseña: @JOiPU4&32KgRJzVQfbJoGHU",
            color: "success",
            updatedAt: 1708032441,
          },
        ],
        contactPersons: [
          {
            personId: "659696b19dcbc6428603896c",
            name: "Marian Balaguer",
            job: "",
            phone: "",
            email: "",
            sendDocuments: 0,
          },
        ],
        shippingAddresses: [],
        isperson: 0,
        createdAt: 1704367793,
        updatedAt: 1710489035,
        updatedHash: "a070b39211d5731e7a0d2376dca3d14b",
      },
    ];

    // Devolver los datos
    return NextResponse.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error("Error al obtener datos de Holded:", error);
    return NextResponse.json(
      {
        error: "Error al obtener datos de Holded",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
