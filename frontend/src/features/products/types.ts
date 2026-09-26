export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type ProductStockRow = {
  productId: string;
  sku: string;
  productName: string;
  categoryName: string;
  uomSymbol: string;

  warehouseId: string;
  warehouseName: string;

  locationId: string;
  locationName: string;

  onHandQty: number;
  reservedQty: number;
  availableQty: number;

  stockStatus: StockStatus;
};
