"use client";

import { useState, useMemo, useEffect } from "react";
import { getAllItems, getMainCategories, getSubCategories } from "@/lib/items";
import { usePurchased } from "@/hooks/usePurchased";
import { useWishlist } from "@/hooks/useWishlist";
import { init as initProfileStore } from "@/lib/profileStore";
import { useSync } from "@/hooks/useSync";
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

  useEffect(() => {
    initProfileStore();
  }, []);

  const { purchasedCount, toggle: togglePurchased, isPurchased } = usePurchased();
  const { wishlistCount, toggle: toggleWishlist, isWishlisted } = useWishlist();
  const { syncStatus } = useSync();

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
    <div className="relative min-h-screen">
      {/* Ambient background orbs */}
      <div className="ambient-orb-top" aria-hidden="true" />
      <div className="ambient-orb-bottom" aria-hidden="true" />

      {/* Content layer */}
      <div className="relative z-10">
        <Header
          purchased={purchasedCount}
          total={allItems.length}
          wishlistCount={wishlistCount}
          wishlistTotalCost={wishlistTotalCost}
          syncStatus={syncStatus}
        />
        <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] cursor-pointer whitespace-nowrap hover:text-[var(--color-foreground)] transition-colors">
                <input
                  type="checkbox"
                  checked={hidePurchased}
                  onChange={(e) => setHidePurchased(e.target.checked)}
                  className="rounded border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/30 focus:ring-offset-0"
                />
                隱藏已購買
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] cursor-pointer whitespace-nowrap hover:text-[var(--color-foreground)] transition-colors">
                <input
                  type="checkbox"
                  checked={showWishlistOnly}
                  onChange={(e) => setShowWishlistOnly(e.target.checked)}
                  className="rounded border-[var(--color-border)] bg-[var(--color-muted)] text-rose-500 focus:ring-rose-500/30 focus:ring-offset-0"
                />
                只顯示願望清單
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] cursor-pointer whitespace-nowrap hover:text-[var(--color-foreground)] transition-colors">
                <input
                  type="checkbox"
                  checked={showPriceDropOnly}
                  onChange={(e) => setShowPriceDropOnly(e.target.checked)}
                  className="rounded border-[var(--color-border)] bg-[var(--color-muted)] text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0"
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

          <p className="text-sm text-[var(--color-muted-foreground)] font-[family-name:var(--font-mono)] tracking-wide">
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

        <footer className="max-w-6xl mx-auto px-6 py-8 mt-12 border-t border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]/60 space-y-1.5">
          <p>FINAL FANTASY XIV &copy; SQUARE ENIX</p>
          <p>Published by USERJOY Technology Co., Ltd. Jointly Published by NADA HOLDINGS.</p>
          <p>
            FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
            All FINAL FANTASY XIV content and materials are trademarks and copyrights of Square Enix or its licensors.
            This site is not affiliated with or endorsed by Square Enix, USERJOY Technology, or NADA HOLDINGS.
          </p>
          <p className="pt-2">
            Source code licensed under{" "}
            <a
              href="https://github.com/hydai/ff14tc-online-shop/blob/master/LICENSE"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] transition-colors focus-visible:text-[var(--color-accent)] focus-visible:outline-none underline decoration-[var(--color-border)] underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apache-2.0
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
