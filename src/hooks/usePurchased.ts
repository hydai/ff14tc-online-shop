"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  subscribe,
  getPurchasedSnapshot,
  togglePurchased,
} from "@/lib/profileStore";

const EMPTY_SET: Set<string> = new Set();

function getServerSnapshot(): Set<string> {
  return EMPTY_SET;
}

export function usePurchased() {
  const purchased = useSyncExternalStore(subscribe, getPurchasedSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    togglePurchased(id);
  }, []);

  const isPurchased = useCallback(
    (id: string) => purchased.has(id),
    [purchased]
  );

  return {
    purchased,
    purchasedCount: purchased.size,
    toggle,
    isPurchased,
  };
}
