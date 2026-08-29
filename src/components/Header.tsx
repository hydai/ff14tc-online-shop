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
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur-md px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight font-[family-name:var(--font-display)]">
            FFXIV 水晶商城清單
          </h1>
          {syncStatus && (
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                syncStatus === "synced"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                  : syncStatus === "syncing"
                  ? "bg-[var(--color-accent)] animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                  : syncStatus === "error"
                  ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
                  : "bg-[var(--color-muted-foreground)]"
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
              <span className="text-xs text-rose-400/80">
                願望清單: {wishlistCount} 件, {wishlistTotalCost.toLocaleString()} 水晶
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
