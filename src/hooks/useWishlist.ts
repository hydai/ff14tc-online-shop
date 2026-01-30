"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ffxiv-tc-wishlist";

let currentIds: Set<string> = new Set();
const listeners = new Set<() => void>();

function loadFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function save(ids: Set<string>) {
  currentIds = ids;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Set<string> {
  return currentIds;
}

const EMPTY_SET: Set<string> = new Set();

function getServerSnapshot(): Set<string> {
  return EMPTY_SET;
}

if (typeof window !== "undefined") {
  currentIds = loadFromStorage();
}

export function useWishlist() {
  const wishlist = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const next = new Set(wishlist);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    save(next);
  }, [wishlist]);

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
