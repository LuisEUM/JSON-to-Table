export interface CustomField {
  field: string;
  value: string;
}

export interface Customer {
  id: string;
  name: string;
  tradeName: string;
  email: string;
  customFields: CustomField[];
}
