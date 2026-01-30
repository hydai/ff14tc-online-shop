"use client";

import { useState, useMemo } from "react";
import { getAllItems, getMainCategories, getSubCategories } from "@/lib/items";
import { usePurchased } from "@/hooks/usePurchased";
import { useWishlist } from "@/hooks/useWishlist";
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
      return true;
    });
  }, [search, selectedMain, selectedSub, hidePurchased, showWishlistOnly, isPurchased, isWishlisted]);

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
          <div className="flex items-center gap-4">
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
