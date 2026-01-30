import data from "../../data/items.json";
import type { StoreItem, CrawlResult } from "@/types";

const crawlResult = data as CrawlResult;

export function getAllItems(): StoreItem[] {
  return crawlResult.items;
}

export function getCrawledAt(): string {
  return crawlResult.crawledAt;
}

export function getTotalCount(): number {
  return crawlResult.totalItems;
}

export interface Category {
  id: string;
  name: string;
}

export function getMainCategories(): Category[] {
  const seen = new Map<string, string>();
  for (const item of crawlResult.items) {
    if (item.mainCategoryId && !seen.has(item.mainCategoryId)) {
      seen.set(item.mainCategoryId, item.mainCategoryName);
    }
  }
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}

export function getSubCategories(mainId: string): Category[] {
  const seen = new Map<string, string>();
  for (const item of crawlResult.items) {
    if (item.mainCategoryId === mainId && item.subCategoryId && !seen.has(item.subCategoryId)) {
      seen.set(item.subCategoryId, item.subCategoryName);
    }
  }
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}
