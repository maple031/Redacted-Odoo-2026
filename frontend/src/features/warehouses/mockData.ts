import { Warehouse } from './types';

export const initialWarehouses: Warehouse[] = [
  {
    id: 'wh-001',
    name: 'Main Warehouse',
    shortCode: 'WH',
    address: '12 Industrial Park Rd, Bengaluru, KA 560099',
    active: true,
  },
  {
    id: 'wh-002',
    name: 'Hyderabad Warehouse',
    shortCode: 'HYD',
    address: '45 HITEC City, Hyderabad, TS 500081',
    active: true,
  },
  {
    id: 'wh-003',
    name: 'Mumbai Warehouse',
    shortCode: 'MUM',
    address: '7 MIDC Andheri, Mumbai, MH 400093',
    active: false,
  },
];
