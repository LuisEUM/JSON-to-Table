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
  {
    userId: "U003",
    personal: {
      nombre: "Miguel Ángel Torres",
      edad: 42,
      email: "miguel.torres@ejemplo.com",
      telefono: "+34 600 789 012",
      direccion: {
        calle: "Plaza España",
        numero: 23,
        codigoPostal: "28008",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "miguelt",
      rol: "instructor",
      nivelAcceso: "avanzado",
      fechaRegistro: "2022-11-10T10:15:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "en",
      notificaciones: false,
    },
    cursosInscritos: [
      {
        cursoId: "C103",
        titulo: "Marketing Digital",
        fechaInscripcion: "2023-03-01T11:00:00Z",
        estado: "en curso",
      },
    ],
  },
  {
    userId: "U004",
    personal: {
      nombre: "Ana Martínez",
      edad: 31,
      email: "ana.martinez@ejemplo.com",
      telefono: "+34 600 345 678",
      direccion: {
        calle: "Gran Vía",
        numero: 78,
        codigoPostal: "28013",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "anam",
      rol: "estudiante",
      nivelAcceso: "básico",
      fechaRegistro: "2023-04-05T15:45:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C104",
        titulo: "Desarrollo Web Frontend",
        fechaInscripcion: "2023-05-01T09:00:00Z",
        estado: "completado",
      },
    ],
  },
  {
    userId: "U005",
    personal: {
      nombre: "Pedro López",
      edad: 29,
      email: "pedro.lopez@ejemplo.com",
      telefono: "+34 600 901 234",
      direccion: {
        calle: "Paseo de la Castellana",
        numero: 156,
        codigoPostal: "28046",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "pedrol",
      rol: "estudiante",
      nivelAcceso: "intermedio",
      fechaRegistro: "2023-02-28T12:30:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C105",
        titulo: "Python Avanzado",
        fechaInscripcion: "2023-03-15T10:30:00Z",
        estado: "en curso",
      },
    ],
  },
  {
    userId: "U006",
    personal: {
      nombre: "María Sánchez",
      edad: 38,
      email: "maria.sanchez@ejemplo.com",
      telefono: "+34 600 567 890",
      direccion: {
        calle: "Calle Alcalá",
        numero: 89,
        codigoPostal: "28009",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "marias",
      rol: "instructor",
      nivelAcceso: "avanzado",
      fechaRegistro: "2022-09-15T14:20:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "en",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C106",
        titulo: "Diseño Gráfico",
        fechaInscripcion: "2022-10-01T08:45:00Z",
        estado: "completado",
      },
    ],
  },
  {
    userId: "U007",
    personal: {
      nombre: "Jorge Fernández",
      edad: 45,
      email: "jorge.fernandez@ejemplo.com",
      telefono: "+34 600 123 789",
      direccion: {
        calle: "Calle Serrano",
        numero: 45,
        codigoPostal: "28001",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "jorgef",
      rol: "instructor",
      nivelAcceso: "avanzado",
      fechaRegistro: "2022-07-20T11:10:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "es",
      notificaciones: false,
    },
    cursosInscritos: [
      {
        cursoId: "C107",
        titulo: "Desarrollo Backend",
        fechaInscripcion: "2022-08-01T13:15:00Z",
        estado: "en curso",
      },
    ],
  },
  {
    userId: "U008",
    personal: {
      nombre: "Laura García",
      edad: 33,
      email: "laura.garcia@ejemplo.com",
      telefono: "+34 600 456 123",
      direccion: {
        calle: "Calle Goya",
        numero: 67,
        codigoPostal: "28003",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "laurag",
      rol: "estudiante",
      nivelAcceso: "intermedio",
      fechaRegistro: "2023-03-10T16:40:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C108",
        titulo: "Marketing en Redes Sociales",
        fechaInscripcion: "2023-04-01T09:20:00Z",
        estado: "completado",
      },
    ],
  },
  {
    userId: "U009",
    personal: {
      nombre: "Roberto Díaz",
      edad: 37,
      email: "roberto.diaz@ejemplo.com",
      telefono: "+34 600 789 456",
      direccion: {
        calle: "Calle Princesa",
        numero: 34,
        codigoPostal: "28008",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "robertod",
      rol: "estudiante",
      nivelAcceso: "básico",
      fechaRegistro: "2023-05-01T10:50:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C109",
        titulo: "SEO y SEM",
        fechaInscripcion: "2023-06-01T11:30:00Z",
        estado: "en curso",
      },
    ],
  },
  {
    userId: "U010",
    personal: {
      nombre: "Carmen Ruiz",
      edad: 41,
      email: "carmen.ruiz@ejemplo.com",
      telefono: "+34 600 234 567",
      direccion: {
        calle: "Calle Velázquez",
        numero: 90,
        codigoPostal: "28006",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "carmenr",
      rol: "instructor",
      nivelAcceso: "avanzado",
      fechaRegistro: "2022-12-01T13:25:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "en",
      notificaciones: false,
    },
    cursosInscritos: [
      {
        cursoId: "C110",
        titulo: "Análisis de Datos",
        fechaInscripcion: "2023-01-15T14:45:00Z",
        estado: "completado",
      },
    ],
  },
  {
    userId: "U011",
    personal: {
      nombre: "David Moreno",
      edad: 32,
      email: "david.moreno@ejemplo.com",
      telefono: "+34 600 345 123",
      direccion: {
        calle: "Calle Fuencarral",
        numero: 123,
        codigoPostal: "28004",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "davidm",
      rol: "estudiante",
      nivelAcceso: "intermedio",
      fechaRegistro: "2023-04-15T09:15:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C111",
        titulo: "JavaScript Avanzado",
        fechaInscripcion: "2023-05-01T10:00:00Z",
        estado: "en curso",
      },
    ],
  },
  {
    userId: "U012",
    personal: {
      nombre: "Isabel Torres",
      edad: 39,
      email: "isabel.torres@ejemplo.com",
      telefono: "+34 600 678 234",
      direccion: {
        calle: "Calle Orense",
        numero: 56,
        codigoPostal: "28020",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "isabelt",
      rol: "instructor",
      nivelAcceso: "avanzado",
      fechaRegistro: "2022-10-10T11:35:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C112",
        titulo: "Gestión de Proyectos",
        fechaInscripcion: "2022-11-01T12:20:00Z",
        estado: "completado",
      },
    ],
  },
  {
    userId: "U013",
    personal: {
      nombre: "Fernando López",
      edad: 36,
      email: "fernando.lopez@ejemplo.com",
      telefono: "+34 600 890 345",
      direccion: {
        calle: "Calle Arturo Soria",
        numero: 78,
        codigoPostal: "28027",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "fernandol",
      rol: "estudiante",
      nivelAcceso: "básico",
      fechaRegistro: "2023-06-01T14:50:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "en",
      notificaciones: false,
    },
    cursosInscritos: [
      {
        cursoId: "C113",
        titulo: "React Native",
        fechaInscripcion: "2023-07-01T15:30:00Z",
        estado: "en curso",
      },
    ],
  },
  {
    userId: "U014",
    personal: {
      nombre: "Patricia Sanz",
      edad: 34,
      email: "patricia.sanz@ejemplo.com",
      telefono: "+34 600 123 567",
      direccion: {
        calle: "Calle O'Donnell",
        numero: 45,
        codigoPostal: "28009",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "patricias",
      rol: "estudiante",
      nivelAcceso: "intermedio",
      fechaRegistro: "2023-02-15T16:40:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C114",
        titulo: "Diseño de Interfaces",
        fechaInscripcion: "2023-03-01T17:15:00Z",
        estado: "completado",
      },
    ],
  },
  {
    userId: "U015",
    personal: {
      nombre: "Alberto Navarro",
      edad: 43,
      email: "alberto.navarro@ejemplo.com",
      telefono: "+34 600 456 789",
      direccion: {
        calle: "Calle Alcántara",
        numero: 89,
        codigoPostal: "28006",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "alberton",
      rol: "instructor",
      nivelAcceso: "avanzado",
      fechaRegistro: "2022-08-20T10:25:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C115",
        titulo: "Node.js Avanzado",
        fechaInscripcion: "2022-09-01T11:10:00Z",
        estado: "en curso",
      },
    ],
  },
  {
    userId: "U016",
    personal: {
      nombre: "Sofía Martín",
      edad: 30,
      email: "sofia.martin@ejemplo.com",
      telefono: "+34 600 234 890",
      direccion: {
        calle: "Calle Diego de León",
        numero: 34,
        codigoPostal: "28006",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "sofiam",
      rol: "estudiante",
      nivelAcceso: "básico",
      fechaRegistro: "2023-07-01T12:45:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "en",
      notificaciones: false,
    },
    cursosInscritos: [
      {
        cursoId: "C116",
        titulo: "Angular Básico",
        fechaInscripcion: "2023-08-01T13:30:00Z",
        estado: "en curso",
      },
    ],
  },
  {
    userId: "U017",
    personal: {
      nombre: "Javier Ruiz",
      edad: 40,
      email: "javier.ruiz@ejemplo.com",
      telefono: "+34 600 567 123",
      direccion: {
        calle: "Calle López de Hoyos",
        numero: 67,
        codigoPostal: "28002",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "javierr",
      rol: "instructor",
      nivelAcceso: "avanzado",
      fechaRegistro: "2022-11-15T14:55:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C117",
        titulo: "Cloud Computing",
        fechaInscripcion: "2022-12-01T15:40:00Z",
        estado: "completado",
      },
    ],
  },
  {
    userId: "U018",
    personal: {
      nombre: "Elena Castro",
      edad: 35,
      email: "elena.castro@ejemplo.com",
      telefono: "+34 600 890 456",
      direccion: {
        calle: "Calle Francisco Silvela",
        numero: 90,
        codigoPostal: "28028",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "elenac",
      rol: "estudiante",
      nivelAcceso: "intermedio",
      fechaRegistro: "2023-05-15T16:20:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C118",
        titulo: "Vue.js",
        fechaInscripcion: "2023-06-01T17:05:00Z",
        estado: "en curso",
      },
    ],
  },
  {
    userId: "U019",
    personal: {
      nombre: "Raúl Jiménez",
      edad: 38,
      email: "raul.jimenez@ejemplo.com",
      telefono: "+34 600 123 890",
      direccion: {
        calle: "Calle Príncipe de Vergara",
        numero: 123,
        codigoPostal: "28002",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "raulj",
      rol: "instructor",
      nivelAcceso: "avanzado",
      fechaRegistro: "2022-09-01T09:30:00Z",
      activo: true,
    },
    preferencias: {
      tema: "oscuro",
      idioma: "en",
      notificaciones: false,
    },
    cursosInscritos: [
      {
        cursoId: "C119",
        titulo: "DevOps",
        fechaInscripcion: "2022-10-01T10:15:00Z",
        estado: "completado",
      },
    ],
  },
  {
    userId: "U020",
    personal: {
      nombre: "Marina González",
      edad: 31,
      email: "marina.gonzalez@ejemplo.com",
      telefono: "+34 600 456 123",
      direccion: {
        calle: "Calle María de Molina",
        numero: 56,
        codigoPostal: "28006",
        ciudad: "Madrid",
        pais: "España",
      },
    },
    cuenta: {
      usuario: "marinag",
      rol: "estudiante",
      nivelAcceso: "básico",
      fechaRegistro: "2023-08-01T11:40:00Z",
      activo: true,
    },
    preferencias: {
      tema: "claro",
      idioma: "es",
      notificaciones: true,
    },
    cursosInscritos: [
      {
        cursoId: "C120",
        titulo: "Ciberseguridad",
        fechaInscripcion: "2023-09-01T12:25:00Z",
        estado: "en curso",
      },
    ],
  },
];
