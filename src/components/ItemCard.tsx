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
    ? "border-[var(--color-accent)]/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
    : isWishlisted
      ? "border-rose-400/30 shadow-[0_0_15px_rgba(251,113,133,0.1)]"
      : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]";

  const previousPrice = getPreviousPrice(item);
  const changePercent = getPriceChangePercent(item);
  const dropped = hasPriceDropped(item);
  const increased = hasPriceIncreased(item);

  const badgeTitle = previousPrice !== null
    ? `原價 ${previousPrice.toLocaleString()} 水晶, 現價 ${item.price.toLocaleString()} 水晶`
    : undefined;

  return (
    <div
      className={`group relative rounded-lg border transition-all duration-300 ease-out overflow-hidden ${borderClass} ${
        purchased ? "opacity-50" : "hover:scale-[1.02] hover:shadow-[0_10px_15px_rgba(0,0,0,0.3)]"
      }`}
      style={{ background: purchased ? "var(--color-card-solid)" : "var(--color-card)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
    >
      {/* Price change badge */}
      {changePercent !== null && (dropped || increased) && (
        <div
          className={`absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-xs font-semibold font-[family-name:var(--font-mono)] tracking-wide ${
            dropped
              ? "bg-emerald-500/90 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              : "bg-orange-500/90 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]"
          }`}
          title={badgeTitle}
        >
          {dropped ? `↓ ${Math.abs(changePercent)}%` : `↑ +${changePercent}%`}
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
            isWishlisted
              ? "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]"
              : "bg-[var(--color-background)]/70 backdrop-blur-sm text-[var(--color-muted-foreground)] hover:text-rose-400 border border-[var(--color-border)]"
          }`}
          aria-label={isWishlisted ? "移除願望清單" : "加入願望清單"}
        >
          <svg className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
            purchased
              ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-[0_0_12px_rgba(245,158,11,0.4)]"
              : "bg-[var(--color-background)]/70 backdrop-blur-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] border border-[var(--color-border)]"
          }`}
          aria-label={purchased ? "取消已購買" : "標記已購買"}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div className="aspect-square bg-[var(--color-muted)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-[var(--color-foreground)] line-clamp-2 leading-tight">
          {item.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          {previousPrice !== null && (
            <span className="text-xs text-[var(--color-muted-foreground)] line-through">
              {previousPrice.toLocaleString()}
            </span>
          )}
          <span className={`text-sm font-semibold ${dropped ? "text-emerald-400" : "text-[var(--color-accent)]"}`}>
            {item.price.toLocaleString()} 水晶
          </span>
        </div>
        <span className="mt-1 block text-xs text-[var(--color-muted-foreground)] font-[family-name:var(--font-mono)] tracking-wide">
          {item.subCategoryName}
        </span>
      </div>
    </div>
  );
}
