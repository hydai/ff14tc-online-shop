export interface PriceEntry {
  price: number;
  date: string; // ISO 8601 timestamp
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  detailUrl: string;
  mainCategoryId: string;
  mainCategoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  promotion: boolean;
  priceHistory: PriceEntry[];
}

export interface CrawlResult {
  crawledAt: string;
  totalItems: number;
  items: StoreItem[];
}
