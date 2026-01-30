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

export interface Profile {
  id: string;            // 8-char alphanumeric (share code)
  name: string;          // Character name
  purchased: string[];   // Item IDs
  wishlist: string[];    // Item IDs
  updatedAt: number;     // Unix ms timestamp
}

export interface ProfileStore {
  version: 1;
  activeProfileId: string | null;
  profiles: Profile[];
}
