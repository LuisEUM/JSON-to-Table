import type { ReactElement } from "react";
import type { Customer } from "./customer";

export enum MembershipStatus {
  ABOUT_TO_START = "about-to-start",
  ACTIVE = "active",
  ABOUT_TO_END = "about-to-end",
  DEACTIVATED = "deactivated",
  NO_STATUS = "no-status",
}

export enum IncidentType {
  PAYMENT_FAILURE = "payment-failure",
  INCOMPLETE_TRAINING = "incomplete-training",
  SERVICE_INTERRUPTION = "service-interruption",
  CONTRACT_BREACH = "contract-breach",
  GENERAL = "general",
}

export interface CustomerStatusResult {
  clientStatus: MembershipStatus | null;
  [MembershipStatus.ACTIVE]: string[];
  [MembershipStatus.ABOUT_TO_START]: string[];
  [MembershipStatus.ABOUT_TO_END]: string[];
  [MembershipStatus.DEACTIVATED]: string[];
  [MembershipStatus.NO_STATUS]: string[];
}

export interface StatusColumn {
  id: string;
  header: string;
  cell: ({ row }: { row: { original: Customer } }) => ReactElement | string;
}
