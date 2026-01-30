# Price History Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Track per-item price history across crawler runs, display price change badges on item cards, and add a "price dropped" filter.

**Architecture:** Extend `StoreItem` with a `priceHistory` array. The crawler merges with existing data to preserve history. A new utility module provides price-change helpers. ItemCard shows badges and strikethrough prices. The main page adds a filter.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript, Playwright (crawler)

---

### Task 1: Extend StoreItem type with PriceEntry and priceHistory

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Update `src/types/index.ts`**

Add `PriceEntry` interface and add `priceHistory` field to `StoreItem`:

```typescript
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
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add PriceEntry interface and priceHistory to StoreItem"
```

---

### Task 2: Update crawler to merge price history

**Files:**
- Modify: `scripts/crawl.ts`

**Step 1: Update `scripts/crawl.ts`**

Add these changes to the `main()` function:

1. At the top of `main()`, after the imports section but before `console.log("🚀 Starting...")`, add a function to load existing data:

Add this import at the top of the file alongside the existing `fs` imports:
```typescript
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
```
(Change the existing `import { writeFileSync, mkdirSync } from "fs";` line.)

2. Add this helper type and function before the `main()` function (after the `delay` function):

```typescript
interface OldStoreItem {
  id: string;
  price: number;
  priceHistory?: PriceEntry[];
}

function loadExistingItems(filePath: string): Map<string, OldStoreItem> {
  const map = new Map<string, OldStoreItem>();
  if (!existsSync(filePath)) return map;
  try {
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { items?: OldStoreItem[] };
    if (data.items) {
      for (const item of data.items) {
        map.set(item.id, item);
      }
    }
  } catch {
    console.log("⚠️  Could not load existing data, starting fresh");
  }
  return map;
}
```

Also add import for `PriceEntry`:
```typescript
import type { StoreItem, CrawlResult, PriceEntry } from "../src/types";
```

3. In `main()`, right after `const allItems = new Map<string, StoreItem>();` (line 187), add:

```typescript
  const outDir = join(process.cwd(), "data");
  const outPath = join(outDir, "items.json");
  const existingItems = loadExistingItems(outPath);
  console.log(`📦 Loaded ${existingItems.size} existing items for price history\n`);
```

And remove the duplicate `outDir` and `outPath` declarations from later in the function (around lines 299-301). Keep the `mkdirSync` call.

4. Replace the output section (the `// Output results` block, starting at line 292 through line 302) with:

```typescript
  // Merge price history
  const crawledAt = new Date().toISOString();
  const mergedItems: StoreItem[] = [];

  for (const item of allItems.values()) {
    const existing = existingItems.get(item.id);
    let priceHistory: PriceEntry[];

    if (existing && existing.priceHistory && existing.priceHistory.length > 0) {
      // Item exists with history
      if (existing.priceHistory[0].price !== item.price) {
        // Price changed — prepend new entry
        priceHistory = [{ price: item.price, date: crawledAt }, ...existing.priceHistory];
      } else {
        // Price unchanged — keep existing history
        priceHistory = existing.priceHistory;
      }
    } else {
      // New item or migration from old format
      priceHistory = [{ price: item.price, date: crawledAt }];
    }

    mergedItems.push({ ...item, priceHistory });
  }

  const result: CrawlResult = {
    crawledAt,
    totalItems: mergedItems.length,
    items: mergedItems,
  };

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");
```

**Step 2: Commit**

```bash
git add scripts/crawl.ts
git commit -m "feat: merge price history across crawler runs"
```

---

### Task 3: Migrate existing items.json with priceHistory

**Files:**
- Modify: `data/items.json` (via a one-time migration script)

**Step 1: Create a one-time migration script**

Create `scripts/migrate-price-history.ts`:

```typescript
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const filePath = join(process.cwd(), "data", "items.json");
const raw = readFileSync(filePath, "utf-8");
const data = JSON.parse(raw);

const crawledAt = data.crawledAt || new Date().toISOString();

for (const item of data.items) {
  if (!item.priceHistory) {
    item.priceHistory = [{ price: item.price, date: crawledAt }];
  }
}

writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
console.log(`✅ Migrated ${data.items.length} items with priceHistory`);
```

**Step 2: Run the migration**

Run: `cd /Users/hydai/workspace/vibe/ffxiv-tc-shop-list && npx tsx scripts/migrate-price-history.ts`
Expected: "✅ Migrated 374 items with priceHistory"

**Step 3: Delete the migration script (one-time use)**

```bash
rm scripts/migrate-price-history.ts
```

**Step 4: Commit**

```bash
git add data/items.json
git commit -m "feat: migrate existing items with priceHistory field"
```

---

### Task 4: Create priceUtils helper module

**Files:**
- Create: `src/lib/priceUtils.ts`

**Step 1: Create `src/lib/priceUtils.ts`**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/priceUtils.ts
git commit -m "feat: add price history utility functions"
```

---

### Task 5: Update ItemCard with price badge and strikethrough

**Files:**
- Modify: `src/components/ItemCard.tsx`

**Step 1: Rewrite `src/components/ItemCard.tsx`**

Add price change badge (top-left), strikethrough old price, and tooltip. Import the price utils.

```typescript
"use client";

import type { StoreItem } from "@/types";
import { getPreviousPrice, getPriceChangePercent, hasPriceDropped, hasPriceIncreased } from "@/lib/priceUtils";

interface ItemCardProps {
  item: StoreItem;
  purchased: boolean;
  isWishlisted: boolean;
  onToggle: () => void;
  onToggleWishlist: () => void;
}

export default function ItemCard({ item, purchased, isWishlisted, onToggle, onToggleWishlist }: ItemCardProps) {
  const borderClass = purchased
    ? "border-emerald-500"
    : isWishlisted
      ? "border-rose-400"
      : "border-gray-700 hover:border-gray-500";

  const previousPrice = getPreviousPrice(item);
  const changePercent = getPriceChangePercent(item);
  const dropped = hasPriceDropped(item);
  const increased = hasPriceIncreased(item);

  const badgeTitle = previousPrice !== null
    ? `Was ${previousPrice.toLocaleString()} 水晶, now ${item.price.toLocaleString()} 水晶`
    : undefined;

  return (
    <div
      className={`group relative rounded-lg border-2 transition-all overflow-hidden ${borderClass} ${
        purchased ? "opacity-60" : ""
      }`}
    >
      {/* Price change badge */}
      {changePercent !== null && (dropped || increased) && (
        <div
          className={`absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-xs font-semibold ${
            dropped
              ? "bg-green-500/90 text-white"
              : "bg-orange-500/90 text-white"
          }`}
          title={badgeTitle}
        >
          {dropped ? `↓ ${changePercent}%` : `↑ +${changePercent}%`}
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            isWishlisted
              ? "bg-rose-500 text-white"
              : "bg-gray-800/80 text-gray-400 hover:text-rose-400"
          }`}
          aria-label={isWishlisted ? "移除願望清單" : "加入願望清單"}
        >
          <svg className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            purchased
              ? "bg-emerald-500 text-white"
              : "bg-gray-800/80 text-gray-400 hover:text-emerald-400"
          }`}
          aria-label={purchased ? "取消已購買" : "標記已購買"}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div className="aspect-square bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-2">
        <h3 className="text-sm font-medium text-white line-clamp-2 leading-tight">
          {item.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5">
          {previousPrice !== null && (
            <span className="text-xs text-gray-500 line-through">
              {previousPrice.toLocaleString()}
            </span>
          )}
          <span className={`text-sm font-semibold ${dropped ? "text-green-400" : "text-amber-400"}`}>
            {item.price.toLocaleString()} 水晶
          </span>
        </div>
        <span className="mt-0.5 block text-xs text-gray-500">
          {item.subCategoryName}
        </span>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ItemCard.tsx
git commit -m "feat: add price change badge and strikethrough on ItemCard"
```

---

### Task 6: Add "price dropped" filter to main page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update `src/app/page.tsx`**

Add import for `hasPriceDropped`, new state `showPriceDropOnly`, filter logic, and checkbox UI.

```typescript
"use client";

import { useState, useMemo } from "react";
import { getAllItems, getMainCategories, getSubCategories } from "@/lib/items";
import { usePurchased } from "@/hooks/usePurchased";
import { useWishlist } from "@/hooks/useWishlist";
import { hasPriceDropped } from "@/lib/priceUtils";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import ItemGrid from "@/components/ItemGrid";

const allItems = getAllItems();
const mainCategories = getMainCategories();

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [hidePurchased, setHidePurchased] = useState(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [showPriceDropOnly, setShowPriceDropOnly] = useState(false);

  const { purchasedCount, toggle: togglePurchased, isPurchased } = usePurchased();
  const { wishlistCount, toggle: toggleWishlist, isWishlisted } = useWishlist();

  const subCategories = useMemo(
    () => (selectedMain ? getSubCategories(selectedMain) : []),
    [selectedMain]
  );

  const handleMainChange = (id: string) => {
    setSelectedMain(id);
    setSelectedSub("");
  };

  const wishlistTotalCost = useMemo(() => {
    return allItems
      .filter((item) => isWishlisted(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  }, [isWishlisted]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (selectedMain && item.mainCategoryId !== selectedMain) {
        return false;
      }
      if (selectedSub && item.subCategoryId !== selectedSub) {
        return false;
      }
      if (hidePurchased && isPurchased(item.id)) {
        return false;
      }
      if (showWishlistOnly && !isWishlisted(item.id)) {
        return false;
      }
      if (showPriceDropOnly && !hasPriceDropped(item)) {
        return false;
      }
      return true;
    });
  }, [search, selectedMain, selectedSub, hidePurchased, showWishlistOnly, showPriceDropOnly, isPurchased, isWishlisted]);

  return (
    <div className="min-h-screen">
      <Header
        purchased={purchasedCount}
        total={allItems.length}
        wishlistCount={wishlistCount}
        wishlistTotalCost={wishlistTotalCost}
      />
      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={hidePurchased}
                onChange={(e) => setHidePurchased(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
              />
              隱藏已購買
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={showWishlistOnly}
                onChange={(e) => setShowWishlistOnly(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-rose-500 focus:ring-rose-500"
              />
              只顯示願望清單
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={showPriceDropOnly}
                onChange={(e) => setShowPriceDropOnly(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
              />
              價格下降
            </label>
          </div>
        </div>

        <CategoryFilter
          mainCategories={mainCategories}
          subCategories={subCategories}
          selectedMain={selectedMain}
          selectedSub={selectedSub}
          onMainChange={handleMainChange}
          onSubChange={setSelectedSub}
        />

        <p className="text-sm text-gray-400">
          顯示 {filtered.length} / {allItems.length} 件商品
        </p>

        <ItemGrid
          items={filtered}
          isPurchased={isPurchased}
          isWishlisted={isWishlisted}
          onToggle={togglePurchased}
          onToggleWishlist={toggleWishlist}
        />
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-6 mt-8 border-t border-gray-800 text-xs text-gray-500 space-y-1">
        <p>FINAL FANTASY XIV &copy; SQUARE ENIX</p>
        <p>Published by USERJOY Technology Co., Ltd. Jointly Published by NADA HOLDINGS.</p>
        <p>
          FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
          All FINAL FANTASY XIV content and materials are trademarks and copyrights of Square Enix or its licensors.
          This site is not affiliated with or endorsed by Square Enix, USERJOY Technology, or NADA HOLDINGS.
        </p>
        <p className="pt-1">
          Source code licensed under{" "}
          <a
            href="https://github.com/hydai/ff14tc-online-shop/blob/master/LICENSE"
            className="text-gray-400 hover:text-gray-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apache-2.0
          </a>
        </p>
      </footer>
    </div>
  );
}
```

Note: The checkbox container `div` changed from `flex items-center gap-4` to `flex flex-wrap items-center gap-4` to handle three checkboxes on smaller screens.

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add price-dropped filter checkbox to main page"
```

---

### Task 7: Build verification

**Step 1: Verify the app builds**

Run: `cd /Users/hydai/workspace/vibe/ffxiv-tc-shop-list && npx next build`
Expected: Build succeeds with no type errors.
