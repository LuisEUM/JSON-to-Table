import { describe, it, expect } from "@jest/globals";
import {
  getMembershipStatus,
  getStatusColorClasses,
  getStatusLabel,
  getCustomerStatus,
  MembershipStatus,
  Customer,
} from "../../lib/holded";

describe("Holded Customer Status Utils", () => {
  describe("getMembershipStatus", () => {
    it("should return NO_STATUS when both dates are N/A", () => {
      expect(getMembershipStatus("N/A", "N/A")).toBe(
        MembershipStatus.NO_STATUS
      );
    });

    it("should return ACTIVE when start date is in the past and end date is more than 30 days in the future", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 40);

      expect(
        getMembershipStatus(pastDate.toISOString(), futureDate.toISOString())
      ).toBe(MembershipStatus.ACTIVE);
    });

    it("should return ABOUT_TO_END when end date is within 30 days", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 15);

      expect(
        getMembershipStatus(pastDate.toISOString(), soonDate.toISOString())
      ).toBe(MembershipStatus.ABOUT_TO_END);
    });

    it("should return ABOUT_TO_START when start date is in the future but within 30 days", () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 15);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 60);

      expect(
        getMembershipStatus(soonDate.toISOString(), futureDate.toISOString())
      ).toBe(MembershipStatus.ABOUT_TO_START);
    });

    it("should return DEACTIVATED when end date is in the past", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const pastEndDate = new Date();
      pastEndDate.setDate(pastEndDate.getDate() - 5);

      expect(
        getMembershipStatus(pastDate.toISOString(), pastEndDate.toISOString())
      ).toBe(MembershipStatus.DEACTIVATED);
    });
  });

  describe("getStatusColorClasses", () => {
    it("should return the correct color class for each status", () => {
      expect(getStatusColorClasses(MembershipStatus.ACTIVE)).toBe(
        "text-green-500 fill-current"
      );
      expect(getStatusColorClasses(MembershipStatus.ABOUT_TO_START)).toBe(
        "text-yellow-500 fill-current"
      );
      expect(getStatusColorClasses(MembershipStatus.ABOUT_TO_END)).toBe(
        "text-orange-500 fill-current"
      );
      expect(getStatusColorClasses(MembershipStatus.DEACTIVATED)).toBe(
        "text-red-500 fill-current"
      );
      expect(getStatusColorClasses(MembershipStatus.NO_STATUS)).toBe(
        "text-gray-400 fill-current"
      );
    });
  });

  describe("getStatusLabel", () => {
    it("should return the correct label for each status", () => {
      expect(getStatusLabel(MembershipStatus.ACTIVE)).toBe("Servicio Activo");
      expect(getStatusLabel(MembershipStatus.ABOUT_TO_START)).toBe(
        "Va a ser Alta"
      );
      expect(getStatusLabel(MembershipStatus.ABOUT_TO_END)).toBe(
        "Va a ser Baja"
      );
      expect(getStatusLabel(MembershipStatus.DEACTIVATED)).toBe(
        "Servicio Desactivado"
      );
      expect(getStatusLabel(MembershipStatus.NO_STATUS)).toBe("Sin Estado");
    });
  });

  describe("getCustomerStatus", () => {
    it("should correctly identify client status from CLIENTE INSIDERS fields", () => {
      const customer: Customer = {
        id: "1",
        name: "Test Customer",
        tradeName: "Test",
        email: "test@example.com",
        customFields: [
          { field: "CLIENTE INSIDERS - Fecha de Inicio", value: "2023-01-01" },
          { field: "CLIENTE INSIDERS - Fecha de Fin", value: "2024-12-31" },
        ],
      };

      const result = getCustomerStatus(customer);
      expect(result.clientStatus).toBe(MembershipStatus.ACTIVE);
    });

    it("should correctly identify services with edition fields", () => {
      const customer: Customer = {
        id: "1",
        name: "Test Customer",
        tradeName: "Test",
        email: "test@example.com",
        customFields: [
          { field: "SERVICIO Contabilidad - Edición", value: "Premium" },
        ],
      };

      const result = getCustomerStatus(customer);
      expect(result[MembershipStatus.ACTIVE]).toContain("Contabilidad");
    });

    it("should correctly identify services with date fields", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 60);

      const customer: Customer = {
        id: "1",
        name: "Test Customer",
        tradeName: "Test",
        email: "test@example.com",
        customFields: [
          {
            field: "SERVICIO Fiscal - Fecha de Inicio",
            value: pastDate.toISOString(),
          },
          {
            field: "SERVICIO Fiscal - Fecha de Fin",
            value: futureDate.toISOString(),
          },
        ],
      };

      const result = getCustomerStatus(customer);
      expect(result[MembershipStatus.ACTIVE]).toContain("Fiscal");
    });

    it("should correctly identify services with state fields", () => {
      const customer: Customer = {
        id: "1",
        name: "Test Customer",
        tradeName: "Test",
        email: "test@example.com",
        customFields: [
          { field: "SERVICIO Laboral - Estado", value: "Activo" },
          { field: "SERVICIO Jurídico - Estado", value: "Desactivado" },
          { field: "SERVICIO Marketing - Estado", value: "Próximo" },
          { field: "SERVICIO Consultoría - Estado", value: "Finaliza pronto" },
        ],
      };

      const result = getCustomerStatus(customer);
      expect(result[MembershipStatus.ACTIVE]).toContain("Laboral");
      expect(result[MembershipStatus.DEACTIVATED]).toContain("Jurídico");
      expect(result[MembershipStatus.ABOUT_TO_START]).toContain("Marketing");
      expect(result[MembershipStatus.ABOUT_TO_END]).toContain("Consultoría");
    });
  });
});
