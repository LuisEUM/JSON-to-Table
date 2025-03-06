/**
 * Utilidades para transformar datos para visualizaciones
 */

import { ChartData, PieChartData } from "../interfaces/analytics-types";

/**
 * Transforma datos de tendencias de membresías para visualización en gráficos
 * @param trends Objeto con tendencias de membresías
 * @returns Datos formateados para visualización
 */
export function formatMembershipTrendsForCharts(trends: {
  activations: Record<string, number>;
  deactivations: Record<string, number>;
  projectedActivations: Record<string, number>;
  projectedDeactivations: Record<string, number>;
}): ChartData {
  // Obtener todas las fechas únicas (keys) de todos los objetos
  const allKeys = new Set<string>([
    ...Object.keys(trends.activations),
    ...Object.keys(trends.deactivations),
    ...Object.keys(trends.projectedActivations),
    ...Object.keys(trends.projectedDeactivations),
  ]);

  // Ordenar las fechas
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    const [yearA, monthA] = a.split("-").map(Number);
    const [yearB, monthB] = b.split("-").map(Number);

    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  });

  // Convertir las claves de fecha a formato legible
  const formattedDates = sortedKeys.map((key) => {
    const [year, month] = key.split("-").map(Number);
    return `${getMonthName(month)} ${year}`;
  });

  // Preparar los datos para el gráfico
  const activationsData = sortedKeys.map((key) => trends.activations[key] || 0);
  const deactivationsData = sortedKeys.map(
    (key) => trends.deactivations[key] || 0
  );
  const projectedActivationsData = sortedKeys.map(
    (key) => trends.projectedActivations[key] || 0
  );
  const projectedDeactivationsData = sortedKeys.map(
    (key) => trends.projectedDeactivations[key] || 0
  );

  // Calcular el balance neto (activaciones - desactivaciones)
  const netBalanceData = sortedKeys.map(
    (key, index) =>
      activationsData[index] +
      projectedActivationsData[index] -
      (deactivationsData[index] + projectedDeactivationsData[index])
  );

  return {
    labels: formattedDates,
    datasets: [
      {
        label: "Activaciones",
        data: activationsData,
        type: "bar",
      },
      {
        label: "Desactivaciones",
        data: deactivationsData,
        type: "bar",
      },
      {
        label: "Proyección Activaciones",
        data: projectedActivationsData,
        type: "bar",
        borderDash: [5, 5],
      },
      {
        label: "Proyección Desactivaciones",
        data: projectedDeactivationsData,
        type: "bar",
        borderDash: [5, 5],
      },
      {
        label: "Balance Neto",
        data: netBalanceData,
        type: "line",
      },
    ],
  };
}

/**
 * Transforma datos de formaciones por año para visualización en gráficos
 * @param trainingsByYear Objeto con formaciones agrupadas por año
 * @returns Datos formateados para visualización
 */
export function formatTrainingsByYearForCharts(
  trainingsByYear: Record<number, Record<string, number>>
): ChartData {
  // Obtener todos los años y nombres de formaciones
  const years = Object.keys(trainingsByYear).map(Number).sort();
  const allTrainingNames = new Set<string>();

  Object.values(trainingsByYear).forEach((yearData) => {
    Object.keys(yearData).forEach((name) => allTrainingNames.add(name));
  });

  const trainingNames = Array.from(allTrainingNames);

  // Crear datasets para cada formación
  const datasets = trainingNames.map((name) => {
    const data = years.map((year) =>
      trainingsByYear[year] && trainingsByYear[year][name]
        ? trainingsByYear[year][name]
        : 0
    );

    return {
      label: name,
      data,
    };
  });

  return {
    labels: years.map((year) => year.toString()),
    datasets,
  };
}

/**
 * Transforma datos de conteo de estados para visualización en gráficos circulares
 * @param statusCounts Objeto con conteo de estados
 * @returns Datos formateados para visualización
 */
export function formatStatusCountsForPieChart(
  statusCounts: Record<string, number>
): PieChartData {
  const labels = Object.keys(statusCounts).map((key) => {
    switch (key) {
      case "active":
        return "Activos";
      case "inactive":
        return "Inactivos";
      case "preDeactivation":
        return "Pre-desactivación";
      default:
        return key;
    }
  });

  return {
    labels,
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          "#4CAF50", // verde para activos
          "#F44336", // rojo para inactivos
          "#FFC107", // amarillo para pre-desactivación
        ],
      },
    ],
  };
}

/**
 * Transforma datos de conteo de antigüedad para visualización en gráficos circulares
 * @param tenureCounts Objeto con conteo de antigüedad
 * @returns Datos formateados para visualización
 */
export function formatTenureCountsForPieChart(
  tenureCounts: Record<string, number>
): PieChartData {
  const labels = Object.keys(tenureCounts).map((key) => {
    switch (key) {
      case "new":
        return "Nuevos";
      case "onboarding":
        return "En onboarding";
      case "loyal":
        return "Leales";
      case "legend":
        return "Leyendas";
      default:
        return key;
    }
  });

  return {
    labels,
    datasets: [
      {
        data: Object.values(tenureCounts),
        backgroundColor: [
          "#E91E63", // rosa para nuevos
          "#9C27B0", // morado para onboarding
          "#3F51B5", // índigo para leales
          "#009688", // teal para leyendas
        ],
      },
    ],
  };
}

/**
 * Obtiene el nombre del mes a partir de su número (0-11)
 */
function getMonthName(month: number): string {
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return monthNames[month];
}
