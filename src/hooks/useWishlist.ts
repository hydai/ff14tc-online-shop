"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  subscribe,
  getWishlistSnapshot,
  toggleWishlist,
} from "@/lib/profileStore";

const EMPTY_SET: Set<string> = new Set();

function getServerSnapshot(): Set<string> {
  return EMPTY_SET;
}

export function useWishlist() {
  const wishlist = useSyncExternalStore(subscribe, getWishlistSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    toggleWishlist(id);
  }, []);

  const isWishlisted = useCallback(
    (id: string) => wishlist.has(id),
    [wishlist]
  );

  return {
    wishlist,
    wishlistCount: wishlist.size,
    toggle,
    isWishlisted,
  };
}
