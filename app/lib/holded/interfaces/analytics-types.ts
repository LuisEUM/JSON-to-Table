/**
 * Tipos para las funciones de análisis y visualización
 */

import { TrainingInfo } from "./contact-types";

/**
 * Resultado del cálculo de KPIs
 */
export interface KPIResult {
  /**
   * Evolución de formaciones agrupadas por nombre
   */
  trainingEvolution: Record<
    string,
    Array<{
      contactId: string;
      startDate: string;
      status: TrainingInfo["status"];
    }>
  >;

  /**
   * Formaciones agrupadas por año y nombre
   */
  trainingsByYear: Record<number, Record<string, number>>;

  /**
   * Tendencias de membresías (activaciones y desactivaciones)
   */
  membershipTrends: {
    /**
     * Activaciones históricas por mes
     */
    activations: Record<string, number>;

    /**
     * Desactivaciones históricas por mes
     */
    deactivations: Record<string, number>;

    /**
     * Proyección de activaciones futuras
     */
    projectedActivations: Record<string, number>;

    /**
     * Proyección de desactivaciones futuras
     */
    projectedDeactivations: Record<string, number>;
  };

  /**
   * Conteo de contactos por estado
   */
  statusCounts: {
    active: number;
    inactive: number;
    preDeactivation: number;
    inactiveWithServices: number;
  };

  /**
   * Conteo de contactos por antigüedad
   */
  tenureCounts: {
    new: number;
    onboarding: number;
    loyal: number;
    legend: number;
  };

  /**
   * Número total de contactos analizados
   */
  totalContacts: number;
}

/**
 * Formato de datos para gráficos de barras/líneas
 */
export interface ChartData {
  /**
   * Etiquetas para el eje X
   */
  labels: string[];

  /**
   * Conjuntos de datos para el gráfico
   */
  datasets: Array<{
    /**
     * Nombre del conjunto de datos
     */
    label: string;

    /**
     * Valores para cada etiqueta
     */
    data: number[];

    /**
     * Tipo de gráfico (opcional)
     */
    type?: "bar" | "line";

    /**
     * Estilo de línea discontinua (opcional)
     */
    borderDash?: number[];

    /**
     * Color de fondo (opcional)
     */
    backgroundColor?: string | string[];
  }>;
}

/**
 * Formato de datos para gráficos circulares
 */
export interface PieChartData {
  /**
   * Etiquetas para cada segmento
   */
  labels: string[];

  /**
   * Conjuntos de datos para el gráfico
   */
  datasets: Array<{
    /**
     * Valores para cada segmento
     */
    data: number[];

    /**
     * Colores de fondo para cada segmento
     */
    backgroundColor: string[];
  }>;
}
