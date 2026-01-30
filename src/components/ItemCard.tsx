"use client";

import type { StoreItem } from "@/types";

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

  return (
    <div
      className={`group relative rounded-lg border-2 transition-all overflow-hidden ${borderClass} ${
        purchased ? "opacity-60" : ""
      }`}
    >
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
