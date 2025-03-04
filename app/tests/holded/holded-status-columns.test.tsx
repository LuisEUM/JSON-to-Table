import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  MembershipStatus,
} from "../../lib/holded/interfaces/status-types";
import { StatusCell } from "../../lib/holded/components/holded-status-columns";

describe("Holded Status Components", () => {
  describe("StatusCell", () => {
    it("should render the status cell with the correct color and label", () => {
      // Arrange
      const status = MembershipStatus.ACTIVE;

      // Act
      render(<StatusCell status={status} />);

      // Assert
      const statusElement = screen.getByText("Servicio Activo");
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.parentElement).toHaveClass("text-green-500");
    });

    it("should render the status cell for ABOUT_TO_END status", () => {
      // Arrange
      const status = MembershipStatus.ABOUT_TO_END;

      // Act
      render(<StatusCell status={status} />);

      // Assert
      const statusElement = screen.getByText("Va a ser Baja");
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.parentElement).toHaveClass("text-orange-500");
    });

    it("should render the status cell for NO_STATUS", () => {
      // Arrange
      const status = MembershipStatus.NO_STATUS;

      // Act
      render(<StatusCell status={status} />);

      // Assert
      const statusElement = screen.getByText("Sin Estado");
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.parentElement).toHaveClass("text-gray-400");
    });
  });
});
