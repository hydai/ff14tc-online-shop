"use client";

import { useState, useMemo } from "react";
import { getAllItems, getMainCategories, getSubCategories } from "@/lib/items";
import { usePurchased } from "@/hooks/usePurchased";
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

  const { purchasedCount, toggle, isPurchased } = usePurchased();

  const subCategories = useMemo(
    () => (selectedMain ? getSubCategories(selectedMain) : []),
    [selectedMain]
  );

  const handleMainChange = (id: string) => {
    setSelectedMain(id);
    setSelectedSub("");
  };

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
      return true;
    });
  }, [search, selectedMain, selectedSub, hidePurchased, isPurchased]);

  return (
    <div className="min-h-screen">
      <Header purchased={purchasedCount} total={allItems.length} />
      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={hidePurchased}
              onChange={(e) => setHidePurchased(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
            />
            隱藏已購買
          </label>
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
          onToggle={toggle}
        />
      </main>
    </div>
  );
}
