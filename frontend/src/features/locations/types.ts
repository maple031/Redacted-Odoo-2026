export type LocationType = 'INTERNAL' | 'VENDOR' | 'CUSTOMER' | 'LOSS' | 'TRANSIT';

export type Location = {
  id: string;
  name: string;
  code: string;
  locationType: LocationType;
  warehouseId: string | null;
  parentLocationId: string | null;
  active: boolean;
};
