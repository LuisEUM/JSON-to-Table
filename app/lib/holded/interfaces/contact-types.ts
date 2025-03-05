/**
 * Interfaces para la gestión de contactos de Holded
 */

/**
 * Interfaz para los contactos obtenidos directamente de la API de Holded
 */
export interface HoldedContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  customer_group?: string;
  notes?: string;
  created_at?: string;
  customFields?: Record<string, unknown>; // Campos personalizados que vienen de Holded
  [key: string]: unknown; // Índice de firma para permitir propiedades adicionales
}

/**
 * Interfaz para los contactos procesados con información adicional
 */
export interface ProcessedContact extends HoldedContact {
  // Campos calculados
  status: "active" | "inactive" | "pre-deactivation" | "inactive-with-services";
  tenure: "new" | "onboarding" | "loyal" | "legend";
  memberships: MembershipInfo[];
  trainings: TrainingInfo[];
}

/**
 * Información sobre membresías de un contacto
 */
export interface MembershipInfo {
  id: string;
  name: string;
  status: "active" | "pending" | "expiring-soon" | "inactive";
  startDate: string;
  endDate: string;
  type: "monthly" | "quarterly" | "biannual" | "annual";
}

/**
 * Información sobre formaciones de un contacto
 */
export interface TrainingInfo {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "ending-soon" | "completed" | "extended";
  startDate: string;
  endDate: string;
  extendedEndDate?: string; // Fecha extendida opcional (típicamente 1 año después)
}

/**
 * Error personalizado para la API de Holded
 */
export class HoldedApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "HoldedApiError";
  }
}
