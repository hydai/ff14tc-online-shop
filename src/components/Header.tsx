"use client";

import ProgressBar from "./ProgressBar";
import ProfileManager from "./ProfileManager";

interface HeaderProps {
  purchased: number;
  total: number;
  wishlistCount: number;
  wishlistTotalCost: number;
  syncStatus?: "synced" | "syncing" | "error" | "offline";
}

export default function Header({ purchased, total, wishlistCount, wishlistTotalCost, syncStatus }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">
            FFXIV 水晶商城清單
          </h1>
          {syncStatus && (
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                syncStatus === "synced"
                  ? "bg-green-400"
                  : syncStatus === "syncing"
                  ? "bg-yellow-400 animate-pulse"
                  : syncStatus === "error"
                  ? "bg-red-400"
                  : "bg-gray-500"
              }`}
              title={
                syncStatus === "synced"
                  ? "已同步"
                  : syncStatus === "syncing"
                  ? "同步中..."
                  : syncStatus === "error"
                  ? "同步失敗"
                  : "離線"
              }
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          <ProfileManager />
          <div className="flex flex-col gap-1 sm:items-end">
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
      </div>
    </header>
  );
}
