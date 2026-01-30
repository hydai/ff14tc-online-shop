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
}

export interface CrawlResult {
  crawledAt: string;
  totalItems: number;
  items: StoreItem[];
}
