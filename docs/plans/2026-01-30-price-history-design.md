# Price History Tracking

## Overview

Track price changes over time for each item in the FFXIV Crystal Store. When the crawler detects a price change, it records the new price alongside previous ones. Users see badges on items whose prices changed, with a filter to show only price-dropped items.

## Data Model

Add `PriceEntry` interface and `priceHistory` field to `StoreItem`:

```typescript
export interface PriceEntry {
  price: number;
  date: string; // ISO 8601 timestamp
}

export interface StoreItem {
  // ... existing fields ...
  price: number;              // current price (unchanged)
  priceHistory: PriceEntry[]; // all observed prices, newest first
}
```

Rules:
- `priceHistory` is sorted newest-first
- New entries are prepended only when price changes (or on first crawl)
- `priceHistory[0].price` always equals `price`
- Single-entry history means the price has never changed

## Crawler Changes

File: `scripts/crawl.ts`

The crawler merges with existing data instead of overwriting:

1. Load existing `data/items.json` if it exists, build lookup map by item ID
2. Crawl as usual (no changes to fetch/parse logic)
3. Merge step per item:
   - Item exists, price unchanged: keep existing `priceHistory`
   - Item exists, price changed: prepend new `PriceEntry`
   - New item: create `priceHistory` with one entry
4. Items in old data but not in new crawl are dropped (no longer in store)
5. Migration: items missing `priceHistory` get initialized with `[{ price, date: crawledAt }]`

## Price Utility Functions

File: `src/lib/priceUtils.ts` (new)

```typescript
getPreviousPrice(item: StoreItem): number | null
hasPriceDropped(item: StoreItem): boolean
hasPriceIncreased(item: StoreItem): boolean
getPriceChangePercent(item: StoreItem): number | null
```

## UI: Item Card Badge & Price Display

File: `src/components/ItemCard.tsx`

Badge (top-left corner):
- Price dropped: green badge (`bg-green-500/90 text-white`), "↓ -X%"
- Price increased: orange badge (`bg-orange-500/90 text-white`), "↑ +X%"
- No change: no badge
- Tooltip via `title` attribute: "Was {old} 水晶, now {new} 水晶 — Changed on {date}"

Price display in card body:
- With history: strikethrough old price + current price ("~~500~~ → 360 水晶")
- No history: current price only (unchanged)

## UI: Filter

File: `src/app/page.tsx`

New checkbox: "價格下降" (Price dropped)
- Shows only items where current price < previous price
- Green checkbox styling (`text-green-500 focus:ring-green-500`)
- Independent of other filters, combinable with search, category, wishlist, hide purchased

## Files to Modify

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `PriceEntry`, add `priceHistory` to `StoreItem` |
| `scripts/crawl.ts` | Load existing data, merge price history on output |
| `src/lib/priceUtils.ts` | **New** — price change helper functions |
| `src/components/ItemCard.tsx` | Add price badge, strikethrough old price, tooltip |
| `src/app/page.tsx` | Add "價格下降" filter checkbox and filtering logic |

## Files Unchanged

- `src/hooks/usePurchased.ts`
- `src/hooks/useWishlist.ts`
- `src/components/Header.tsx`
- `src/components/ItemGrid.tsx`
- `src/components/ProgressBar.tsx`
- `src/components/SearchBar.tsx`
- `src/components/CategoryFilter.tsx`
- `src/lib/items.ts`
