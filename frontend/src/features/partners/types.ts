export type BusinessPartner = {
  id: string;
  name: string;
  isSupplier: boolean;
  isCustomer: boolean;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
};
