"use client";

import ProgressBar from "./ProgressBar";

interface HeaderProps {
  purchased: number;
  total: number;
  wishlistCount: number;
  wishlistTotalCost: number;
}

export default function Header({ purchased, total, wishlistCount, wishlistTotalCost }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-white">
          FFXIV 水晶商城清單
        </h1>
        <div className="flex flex-col gap-1 w-full sm:w-auto sm:items-end">
          <div className="w-full sm:w-72">
            <ProgressBar purchased={purchased} total={total} />
          </div>
          {wishlistCount > 0 && (
            <span className="text-xs text-rose-300">
              願望清單: {wishlistCount} 件, {wishlistTotalCost.toLocaleString()} 水晶
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
