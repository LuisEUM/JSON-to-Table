import { describe, it, expect } from "@jest/globals";
import {
  extractCategory,
  extractServiceName,
  getUniqueCategories,
  getServicesForCategory,
  processCustomFields,
  extractServiceMetrics,
} from "../../lib/holded/utils/holded-contacts-service-utils";
import { Customer } from "../../lib/holded/interfaces/customer";

describe("Holded Contacts Service Utils", () => {
  describe("extractCategory", () => {
    it("should extract the first word as category", () => {
      expect(extractCategory("SERVICIO Contabilidad - Edición")).toBe(
        "SERVICIO"
      );
      expect(extractCategory("CLIENTE INSIDERS - Fecha de Inicio")).toBe(
        "CLIENTE"
      );
    });
  });

  describe("extractServiceName", () => {
    it("should extract service name after dash", () => {
      expect(extractServiceName("SERVICIO Contabilidad - Edición")).toBe(
        "Edición"
      );
    });

    it("should return the whole string if no dash is present", () => {
      expect(extractServiceName("SERVICIO Contabilidad")).toBe(
        "SERVICIO Contabilidad"
      );
    });
  });

  describe("getUniqueCategories", () => {
    it("should return unique categories from customer fields", () => {
      const customers: Customer[] = [
        {
          id: "1",
          name: "Customer 1",
          tradeName: "C1",
          email: "c1@example.com",
          customFields: [
            { field: "SERVICIO Contabilidad - Edición", value: "Premium" },
            {
              field: "CLIENTE INSIDERS - Fecha de Inicio",
              value: "2023-01-01",
            },
          ],
        },
        {
          id: "2",
          name: "Customer 2",
          tradeName: "C2",
          email: "c2@example.com",
          customFields: [
            { field: "SERVICIO Fiscal - Estado", value: "Activo" },
            { field: "CLIENTE INSIDERS - Fecha de Fin", value: "2024-12-31" },
          ],
        },
      ];

      const categories = getUniqueCategories(customers);
      expect(categories).toContain("SERVICIO");
      expect(categories).toContain("CLIENTE");
      expect(categories.length).toBe(2);
    });
  });

  describe("getServicesForCategory", () => {
    it("should return services for a specific category", () => {
      const customers: Customer[] = [
        {
          id: "1",
          name: "Customer 1",
          tradeName: "C1",
          email: "c1@example.com",
          customFields: [
            { field: "SERVICIO Contabilidad - Edición", value: "Premium" },
            { field: "SERVICIO Fiscal - Estado", value: "Activo" },
            {
              field: "CLIENTE INSIDERS - Fecha de Inicio",
              value: "2023-01-01",
            },
          ],
        },
      ];

      const services = getServicesForCategory(customers, "SERVICIO");
      expect(services).toContain("Edición");
      expect(services).toContain("Estado");
      expect(services.length).toBe(2);
    });
  });

  describe("processCustomFields", () => {
    it("should correctly process a field with subcategory and property", () => {
      const result = processCustomFields({
        field: "SERVICIO Contabilidad - Edición",
        value: "Premium",
      });

      expect(result.mainCategory).toBe("SERVICIO");
      expect(result.subCategory).toBe("Contabilidad");
      expect(result.property).toBe("Edición");
    });

    it("should handle fields without property", () => {
      const result = processCustomFields({
        field: "SERVICIO Contabilidad",
        value: "Premium",
      });

      expect(result.mainCategory).toBe("SERVICIO");
      expect(result.subCategory).toBe("Contabilidad");
      expect(result.property).toBe("");
    });
  });

  describe("extractServiceMetrics", () => {
    it("should extract metrics from customer data", () => {
      const customers: Customer[] = [
        {
          id: "1",
          name: "Customer 1",
          tradeName: "C1",
          email: "c1@example.com",
          customFields: [
            { field: "SERVICIO Contabilidad - Edición", value: "Premium" },
            { field: "SERVICIO Contabilidad - Consultor", value: "Juan Pérez" },
          ],
        },
        {
          id: "2",
          name: "Customer 2",
          tradeName: "C2",
          email: "c2@example.com",
          customFields: [
            { field: "SERVICIO Contabilidad - Edición", value: "Basic" },
            {
              field: "SERVICIO Contabilidad - Consultor",
              value: "María López",
            },
          ],
        },
      ];

      const metrics = extractServiceMetrics(customers);

      // Verificar que se creó la categoría SERVICIO
      expect(metrics.categories.has("SERVICIO")).toBe(true);

      const serviceCategory = metrics.categories.get("SERVICIO");
      expect(serviceCategory).toBeDefined();

      if (serviceCategory) {
        // Verificar que se creó la subcategoría Contabilidad
        expect(serviceCategory.subCategories.has("Contabilidad")).toBe(true);

        const contabilidadSubcat =
          serviceCategory.subCategories.get("Contabilidad");
        expect(contabilidadSubcat).toBeDefined();

        if (contabilidadSubcat) {
          // Verificar que se registraron las ediciones
          expect(contabilidadSubcat.metrics.editions.has("Premium")).toBe(true);
          expect(contabilidadSubcat.metrics.editions.has("Basic")).toBe(true);

          // Verificar que se registraron los consultores
          expect(contabilidadSubcat.metrics.consultants.has("Juan Pérez")).toBe(
            true
          );
          expect(
            contabilidadSubcat.metrics.consultants.has("María López")
          ).toBe(true);

          // Verificar métricas generales
          expect(contabilidadSubcat.metrics.activeClients).toBe(2);
          expect(contabilidadSubcat.metrics.totalClients).toBe(2);
        }
      }
    });

    it("should handle empty or invalid customer data", () => {
      const emptyMetrics = extractServiceMetrics([]);
      expect(emptyMetrics.categories.size).toBe(0);

      const invalidMetrics = extractServiceMetrics(null as any);
      expect(invalidMetrics.categories.size).toBe(0);
    });
  });
});
