"use client";

import type { StoreItem } from "@/types";

interface ItemCardProps {
  item: StoreItem;
  purchased: boolean;
  onToggle: () => void;
}

export default function ItemCard({ item, purchased, onToggle }: ItemCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`group relative cursor-pointer rounded-lg border-2 transition-all overflow-hidden ${
        purchased
          ? "border-emerald-500 opacity-60"
          : "border-gray-700 hover:border-gray-500"
      }`}
    >
      {purchased && (
        <div className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
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
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-amber-400">
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
