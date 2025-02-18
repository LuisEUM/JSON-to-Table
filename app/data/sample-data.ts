export const sampleData = [
  {
    userId: "U001",
    personal: {
      nombre: "Carlos Ramírez",
      edad: 28,
      email: "carlos.ramirez@ejemplo.com",
      telefono: "+34 600 123 456",
      direccion: {
        calle: "Calle Mayor",
        numero: 10,
        codigoPostal: "28004",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "carlosr",
      rol: "estudiante",
      nivelAcceso: "básico",
      fechaRegistro: "2023-06-15T08:00:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C101",
        titulo: "Introducción a la Programación",
        fechaInscripcion: "2023-07-01T10:00:00Z",
        estado: "en curso", // otros estados: completado, abandonado
      },
      {
        cursoId: "C205",
        titulo: "Diseño Web Responsivo",
        fechaInscripcion: "2023-08-12T14:30:00Z",
        estado: "completado",
      },
    ],
    compras: [
      {
        transaccionId: "T1001",
        fecha: "2023-06-15T08:05:00Z",
        total: 49.99,
        items: [
          {
            tipo: "suscripción",
            descripcion: "Plan Básico Mensual",
            precio: 49.99,
          },
        ],
        metodoPago: "tarjeta de crédito",
      },
    ],
  },
  {
    userId: "U002",
    personal: {
      nombre: "Lucía Gómez",
      edad: 35,
      email: "lucia.gomez@ejemplo.com",
      telefono: "+34 600 654 321",
      direccion: {
        calle: "Avenida de la Constitución",
        numero: 45,
        codigoPostal: "28010",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "lucgomez",
      rol: "instructor",
      nivelAcceso: "instructor",
      fechaRegistro: "2022-03-20T09:30:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "en",
      notificaciones: false,
    },
    cursosCreados: [
      {
        cursoId: "C310",
        titulo: "Marketing Digital Avanzado",
        fechaCreacion: "2022-05-10T12:00:00Z",
        estado: "publicado",
      },
    ],
    compras: [
      {
        transaccionId: "T1002",
        fecha: "2022-03-20T09:45:00Z",
        total: 99.99,
        items: [
          {
            tipo: "suscripción",
            descripcion: "Plan Instructor Anual",
            precio: 99.99,
          },
        ],
        metodoPago: "PayPal",
      },
    ],
  },
];

