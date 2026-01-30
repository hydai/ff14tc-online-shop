import type { StoreItem } from "@/types";

export function getPreviousPrice(item: StoreItem): number | null {
  if (item.priceHistory.length < 2) return null;
  return item.priceHistory[1].price;
}

export function hasPriceDropped(item: StoreItem): boolean {
  const prev = getPreviousPrice(item);
  return prev !== null && item.price < prev;
}

export function hasPriceIncreased(item: StoreItem): boolean {
  const prev = getPreviousPrice(item);
  return prev !== null && item.price > prev;
}

export function getPriceChangePercent(item: StoreItem): number | null {
  const prev = getPreviousPrice(item);
  if (prev === null || prev === 0) return null;
  return Math.round(((item.price - prev) / prev) * 100);
}
