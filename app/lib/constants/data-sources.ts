export enum DataSourceType {
  JSON_FILE = "json_file",
  CSV_FILE = "csv_file",
  HOLDED = "holded",
  API = "api",
  DATABASE = "database",
}

export const DATA_SOURCES = [
  {
    id: DataSourceType.JSON_FILE,
    name: "Archivo JSON",
    description: "Cargar datos desde un archivo JSON local",
    icon: "FileJson",
    path: "/data-sources/json-file",
  },
  {
    id: DataSourceType.CSV_FILE,
    name: "Archivo CSV",
    description: "Cargar datos desde un archivo CSV local",
    icon: "FileSpreadsheet",
    path: "/data-sources/csv-file",
  },
  {
    id: DataSourceType.HOLDED,
    name: "Holded API",
    description: "Conectar con Holded para obtener datos en tiempo real",
    icon: "Database",
    path: "/data-sources/holded",
  },
  {
    id: DataSourceType.API,
    name: "API Externa",
    description: "Conectar con una API externa",
    icon: "Globe",
    path: "/data-sources/api",
  },
  {
    id: DataSourceType.DATABASE,
    name: "Base de Datos",
    description: "Conectar con una base de datos",
    icon: "Database",
    path: "/data-sources/database",
  },
];
