/**
 * Utilidades para análisis y cálculo de KPIs de contactos de Holded
 */

import { ProcessedContact, TrainingInfo } from "../interfaces/contact-types";
import { KPIResult } from "../interfaces/analytics-types";

/**
 * Calcula diferentes KPIs a partir de los contactos procesados
 * Genera estadísticas sobre formaciones y tendencias de membresías
 * @param processedContacts Lista de contactos procesados
 * @returns Objeto con los KPIs calculados
 */
export function calculateKPIs(
  processedContacts: ProcessedContact[]
): KPIResult {
  const currentDate = new Date();

  // 1. Agregación por formaciones: Agrupar información de formaciones por nombre
  const trainingsByName: Record<
    string,
    Array<{
      contactId: string;
      startDate: string;
      status: TrainingInfo["status"];
    }>
  > = {};

  // Agrupación de formaciones por año
  const trainingsByYear: Record<number, Record<string, number>> = {};

  // Procesar formaciones de cada contacto
  processedContacts.forEach((contact) => {
    contact.trainings.forEach((training) => {
      // Agregación por nombre
      if (!trainingsByName[training.name]) {
        trainingsByName[training.name] = [];
      }
      trainingsByName[training.name].push({
        contactId: contact.id,
        startDate: training.startDate,
        status: training.status,
      });

      // Agregación por año
      const year = new Date(training.startDate).getFullYear();
      if (!trainingsByYear[year]) {
        trainingsByYear[year] = {};
      }
      if (!trainingsByYear[year][training.name]) {
        trainingsByYear[year][training.name] = 0;
      }
      trainingsByYear[year][training.name]++;
    });
  });

  // 2. Tendencias de membresías
  const membershipTrends = {
    activations: {} as Record<string, number>,
    deactivations: {} as Record<string, number>,
    projectedActivations: {} as Record<string, number>,
    projectedDeactivations: {} as Record<string, number>,
  };

  processedContacts.forEach((contact) => {
    contact.memberships.forEach((membership) => {
      const startYear = new Date(membership.startDate).getFullYear();
      const startMonth = new Date(membership.startDate).getMonth();
      const endYear = new Date(membership.endDate).getFullYear();
      const endMonth = new Date(membership.endDate).getMonth();

      // Activaciones históricas
      const startKey = `${startYear}-${startMonth}`;
      if (!membershipTrends.activations[startKey]) {
        membershipTrends.activations[startKey] = 0;
      }
      membershipTrends.activations[startKey]++;

      // Desactivaciones históricas
      const endKey = `${endYear}-${endMonth}`;
      if (!membershipTrends.deactivations[endKey]) {
        membershipTrends.deactivations[endKey] = 0;
      }
      membershipTrends.deactivations[endKey]++;

      // Proyecciones (para el mes actual y futuro)
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      if (
        startYear >= currentYear &&
        (startYear > currentYear || startMonth >= currentMonth)
      ) {
        if (!membershipTrends.projectedActivations[startKey]) {
          membershipTrends.projectedActivations[startKey] = 0;
        }
        membershipTrends.projectedActivations[startKey]++;
      }

      if (
        endYear >= currentYear &&
        (endYear > currentYear || endMonth >= currentMonth)
      ) {
        if (!membershipTrends.projectedDeactivations[endKey]) {
          membershipTrends.projectedDeactivations[endKey] = 0;
        }
        membershipTrends.projectedDeactivations[endKey]++;
      }
    });
  });

  // 3. Calcular estadísticas adicionales
  const statusCounts = {
    active: processedContacts.filter((c) => c.status === "active").length,
    inactive: processedContacts.filter((c) => c.status === "inactive").length,
    preDeactivation: processedContacts.filter(
      (c) => c.status === "pre-deactivation"
    ).length,
    inactiveWithServices: processedContacts.filter(
      (c) => c.status === "inactive-with-services"
    ).length,
  };

  const tenureCounts = {
    new: processedContacts.filter((c) => c.tenure === "new").length,
    onboarding: processedContacts.filter((c) => c.tenure === "onboarding")
      .length,
    loyal: processedContacts.filter((c) => c.tenure === "loyal").length,
    legend: processedContacts.filter((c) => c.tenure === "legend").length,
  };

  return {
    trainingEvolution: trainingsByName,
    trainingsByYear,
    membershipTrends,
    statusCounts,
    tenureCounts,
    totalContacts: processedContacts.length,
  };
}
