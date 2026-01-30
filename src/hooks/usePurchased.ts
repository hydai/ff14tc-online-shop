"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ffxiv-tc-purchased";

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

// Initialize on first client-side load
if (typeof window !== "undefined") {
  currentIds = loadFromStorage();
}

export function usePurchased() {
  const purchased = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const next = new Set(purchased);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    save(next);
  }, [purchased]);

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
