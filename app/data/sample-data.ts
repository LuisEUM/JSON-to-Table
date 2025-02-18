export const sampleData = [
  {
    texto: "Hola mundo",
    numero: 42,
    decimal: 3.14159,
    booleano: true,
    fecha: "2024-02-17T12:00:00Z",
    nulo: null,
    indefinido: undefined,
    listaNumeros: [1, 2, 3, 4, 5],
    listaTextos: ["uno", "dos", "tres"],
    listaMixta: [1, "dos", true, null],
    configuracion: {
      activo: true,
      nombre: "Config1",
      valor: 100,
    },
    usuario: {
      personal: {
        nombre: "Juan",
        edad: 25,
        activo: true,
        direccion: {
          calle: "Calle Principal",
          numero: 123,
          codigoPostal: "28001",
        },
      },
      preferencias: {
        tema: "oscuro",
        notificaciones: true,
        idioma: "es",
      },
    },
    pedidos: [
      {
        id: "P001",
        fecha: "2024-01-15T10:30:00Z",
        total: 150.75,
        estado: "entregado",
        items: [
          { producto: "Camiseta", cantidad: 2, precio: 25.5 },
          { producto: "Pantalón", cantidad: 1, precio: 99.75 },
        ],
      },
      {
        id: "P002",
        fecha: "2024-02-01T14:45:00Z",
        total: 50.25,
        estado: "en proceso",
        items: [
          { producto: "Libro", cantidad: 1, precio: 15.99 },
          { producto: "Lápices", cantidad: 2, precio: 17.13 },
        ],
      },
    ],
  },
  {
    texto: "¡Adiós mundo!",
    numero: 84,
    decimal: 2.71828,
    booleano: false,
    fecha: "2024-02-18T15:30:00Z",
    nulo: null,
    indefinido: undefined,
    listaNumeros: [6, 7, 8, 9, 10],
    listaTextos: ["cuatro", "cinco", "seis"],
    listaMixta: [2, "tres", false, null],
    configuracion: {
      activo: false,
      nombre: "Config2",
      valor: 200,
    },
    usuario: {
      personal: {
        nombre: "María",
        edad: 30,
        activo: true,
        direccion: {
          calle: "Avenida Secundaria",
          numero: 456,
          codigoPostal: "28002",
        },
      },
      preferencias: {
        tema: "claro",
        notificaciones: false,
        idioma: "en",
      },
    },
    pedidos: [
      {
        id: "P003",
        fecha: "2024-02-10T09:15:00Z",
        total: 75.5,
        estado: "enviado",
        items: [{ producto: "Zapatillas", cantidad: 1, precio: 75.5 }],
      },
      {
        id: "P004",
        fecha: "2024-02-20T16:20:00Z",
        total: 120.0,
        estado: "pendiente",
        items: [
          { producto: "Bolso", cantidad: 1, precio: 85.0 },
          { producto: "Bufanda", cantidad: 1, precio: 35.0 },
        ],
      },
    ],
  },
]

