import { BaseDataSourceService } from "./base-data-source.service";
import {
  ApiDataSource,
  DataSourceResponse,
} from "../../interfaces/data-source";
import { DataSourceType } from "../../constants/data-sources";

export interface HoldedConfig {
  apiKey: string;
  endpoint: string;
  moduleType?: string;
  limit?: number;
  offset?: number;
}

export interface HoldedData {
  id: string;
  [key: string]: unknown;
}

export class HoldedDataSourceService
  extends BaseDataSourceService
  implements ApiDataSource
{
  public apiKey?: string;
  public baseUrl = "https://api.holded.com/api";
  public endpoint?: string;
  public headers: Record<string, string> = {};
  public override type: DataSourceType.HOLDED = DataSourceType.HOLDED;

  constructor(config?: Partial<HoldedConfig>) {
    super(DataSourceType.HOLDED);

    if (config) {
      this.apiKey = config.apiKey;
      this.endpoint = config.endpoint;
      this.updateHeaders();
    }
  }

  private updateHeaders() {
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (this.apiKey) {
      this.headers["key"] = this.apiKey;
    }
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        throw new Error("API Key de Holded no configurada");
      }

      // Verificar conexión haciendo una petición simple
      const response = await fetch(`${this.baseUrl}/invoicing/v1/warehouses`, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error al conectar con Holded: ${
            errorData.message || response.statusText
          }`
        );
      }

      this.isConnected = true;
      return true;
    } catch (error) {
      this.isConnected = false;
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error desconocido al conectar con Holded";
      return false;
    }
  }

  async fetchData(params?: Partial<HoldedConfig>): Promise<HoldedData[]> {
    try {
      if (!this.isConnected && !(await this.connect())) {
        throw new Error("No se pudo establecer conexión con Holded");
      }

      const moduleType = params?.moduleType || "invoicing";
      const endpoint = params?.endpoint || this.endpoint || "documents";
      const limit = params?.limit || 100;
      const offset = params?.offset || 0;

      const url = `${this.baseUrl}/${moduleType}/v1/${endpoint}?limit=${limit}&offset=${offset}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error al obtener datos de Holded: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener datos de Holded";
      return [];
    }
  }

  async checkConnection(): Promise<DataSourceResponse<boolean>> {
    try {
      const isConnected = await this.connect();
      return this.createSuccessResponse([isConnected]);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error
          ? error.message
          : "Error al verificar conexión con Holded"
      );
    }
  }

  // Métodos específicos de Holded
  async getClients(): Promise<DataSourceResponse<HoldedData>> {
    try {
      const clients = await this.fetchData({
        moduleType: "invoicing",
        endpoint: "contacts",
      });
      return this.createSuccessResponse(clients);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error
          ? error.message
          : "Error al obtener clientes de Holded"
      );
    }
  }

  async getInvoices(): Promise<DataSourceResponse<HoldedData>> {
    try {
      const invoices = await this.fetchData({
        moduleType: "invoicing",
        endpoint: "documents/invoice",
      });
      return this.createSuccessResponse(invoices);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error
          ? error.message
          : "Error al obtener facturas de Holded"
      );
    }
  }

  async getProducts(): Promise<DataSourceResponse<HoldedData>> {
    try {
      const products = await this.fetchData({
        moduleType: "invoicing",
        endpoint: "items",
      });
      return this.createSuccessResponse(products);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error
          ? error.message
          : "Error al obtener productos de Holded"
      );
    }
  }
}
