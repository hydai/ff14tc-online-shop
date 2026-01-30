"use client";

import type { StoreItem } from "@/types";
import ItemCard from "./ItemCard";

interface ItemGridProps {
  items: StoreItem[];
  isPurchased: (id: string) => boolean;
  isWishlisted: (id: string) => boolean;
  onToggle: (id: string) => void;
  onToggleWishlist: (id: string) => void;
}

export default function ItemGrid({ items, isPurchased, isWishlisted, onToggle, onToggleWishlist }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-[var(--color-muted-foreground)] text-lg">找不到符合條件的商品</p>
        <p className="text-[var(--color-muted-foreground)]/50 text-sm mt-2">試試調整搜尋條件或篩選器</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          purchased={isPurchased(item.id)}
          isWishlisted={isWishlisted(item.id)}
          onToggle={() => onToggle(item.id)}
          onToggleWishlist={() => onToggleWishlist(item.id)}
        />
      ))}
    </div>
  );
}
