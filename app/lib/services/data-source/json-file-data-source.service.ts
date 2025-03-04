import { BaseDataSourceService } from "./base-data-source.service";
import {
  FileDataSource,
  DataSourceResponse,
} from "../../interfaces/data-source";
import { DataSourceType } from "../../constants/data-sources";

export interface JsonFileConfig {
  filePath?: string;
  fileContent?: string;
}

export interface JsonData {
  [key: string]: unknown;
}

// Interfaz para la respuesta de validación
export interface ValidationResponse {
  valid: boolean;
}

export class JsonFileDataSourceService<T extends JsonData = JsonData>
  extends BaseDataSourceService<T>
  implements FileDataSource<T>
{
  public filePath?: string;
  public fileContent?: string;
  public override type: DataSourceType.JSON_FILE = DataSourceType.JSON_FILE;

  constructor(config?: JsonFileConfig) {
    super(DataSourceType.JSON_FILE);

    if (config) {
      this.filePath = config.filePath;
      this.fileContent = config.fileContent;
    }
  }

  async connect(): Promise<boolean> {
    // Para archivos, la conexión simplemente verifica que tengamos
    // un archivo válido para procesar
    try {
      if (!this.filePath && !this.fileContent) {
        throw new Error("Se requiere un archivo JSON o contenido");
      }

      this.isConnected = true;
      return true;
    } catch (error) {
      this.isConnected = false;
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error desconocido al conectar con el archivo JSON";
      return false;
    }
  }

  async parseFile(): Promise<T[]> {
    try {
      if (this.fileContent) {
        const parsed = JSON.parse(this.fileContent);
        return Array.isArray(parsed) ? parsed : [parsed];
      }

      if (this.filePath) {
        // En un entorno de navegador, no podemos leer directamente del sistema de archivos
        // Este método sería implementado según cómo se manejan archivos en la aplicación
        throw new Error(
          "Lectura de archivos desde ruta no implementada en el navegador"
        );
      }

      throw new Error("No hay contenido ni ruta de archivo para procesar");
    } catch (error) {
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error al analizar el archivo JSON";
      return [];
    }
  }

  async fetchData(): Promise<T[]> {
    try {
      if (!this.isConnected && !(await this.connect())) {
        throw new Error("No se pudo establecer conexión con el archivo JSON");
      }

      return await this.parseFile();
    } catch (error) {
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener datos del archivo JSON";
      return [];
    }
  }

  async loadJsonContent(content: string): Promise<DataSourceResponse<T>> {
    try {
      this.fileContent = content;
      const data = await this.fetchData();
      return this.createSuccessResponse(data);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error
          ? error.message
          : "Error al cargar contenido JSON"
      );
    }
  }

  // Método específico para validación que devuelve un tipo personalizado
  async validateJson(content: string): Promise<{
    success: boolean;
    valid?: boolean;
    error?: string;
  }> {
    try {
      JSON.parse(content);
      return {
        success: true,
        valid: true,
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        error:
          "JSON inválido: " +
          (error instanceof Error ? error.message : "Error desconocido"),
      };
    }
  }
}
