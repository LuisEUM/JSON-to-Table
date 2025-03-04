export interface ClientInfo {
  id: string;
  name: string;
  edition: string;
  consultant?: string;
}

export interface EditionGroup {
  edition: string;
  clients: ClientInfo[];
}

export interface ConsultantGroup {
  consultant: string;
  editions: Map<string, ClientInfo[]>;
  totalClients: number;
}

export interface ServiceMetrics {
  activeClients: number;
  totalClients: number;
  consultants: Map<string, ConsultantGroup>;
  editions: Map<string, EditionGroup>;
}

export interface SubCategory {
  name: string;
  fields: { field: string; value: string; property: string }[];
  metrics: ServiceMetrics;
}

export interface ServiceCategory {
  name: string;
  subCategories: Map<string, SubCategory>;
  directFields: { field: string; value: string; property: string }[];
  metrics: ServiceMetrics;
}

export interface ServiceMetricsResult {
  categories: Map<string, ServiceCategory>;
}
