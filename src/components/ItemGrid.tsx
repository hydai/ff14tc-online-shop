"use client";

import type { StoreItem } from "@/types";
import ItemCard from "./ItemCard";

interface ItemGridProps {
  items: StoreItem[];
  isPurchased: (id: string) => boolean;
  onToggle: (id: string) => void;
}

export default function ItemGrid({ items, isPurchased, onToggle }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        找不到符合條件的商品
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          purchased={isPurchased(item.id)}
          onToggle={() => onToggle(item.id)}
        />
      ))}
    </div>
  );
}
