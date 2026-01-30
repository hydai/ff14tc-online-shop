import type { Profile, ProfileStore } from "@/types";
import { generateId } from "./idGen";

const STORAGE_KEY = "ffxiv-tc-profiles";
const LEGACY_PURCHASED_KEY = "ffxiv-tc-purchased";
const LEGACY_WISHLIST_KEY = "ffxiv-tc-wishlist";

// --- State ---

let store: ProfileStore = {
  version: 1,
  activeProfileId: null,
  profiles: [],
};

let purchasedSnapshot: Set<string> = new Set();
let wishlistSnapshot: Set<string> = new Set();

const listeners = new Set<() => void>();

// --- Internal helpers ---

function notify() {
  for (const listener of listeners) listener();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function updateSnapshots() {
  const profile = getActiveProfile();
  purchasedSnapshot = profile ? new Set(profile.purchased) : new Set();
  wishlistSnapshot = profile ? new Set(profile.wishlist) : new Set();
}

function getActiveProfile(): Profile | null {
  if (!store.activeProfileId) return null;
  return store.profiles.find((p) => p.id === store.activeProfileId) ?? null;
}

function ensureActiveProfile(): Profile {
  let profile = getActiveProfile();
  if (!profile) {
    profile = {
      id: generateId(),
      name: "光之戰士",
      purchased: [],
      wishlist: [],
      updatedAt: Date.now(),
    };
    store.profiles.push(profile);
    store.activeProfileId = profile.id;
  }
  return profile;
}

function touchActiveProfile() {
  const profile = getActiveProfile();
  if (profile) profile.updatedAt = Date.now();
}

// --- Init + Migration ---

let initialized = false;

export function init() {
  if (initialized) return;
  initialized = true;

  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProfileStore;
      store = parsed;
      updateSnapshots();
      notify();
      return;
    }
  } catch {
    // Corrupted data — fall through to migration
  }

  // Migration: read legacy keys
  let legacyPurchased: string[] = [];
  let legacyWishlist: string[] = [];

  try {
    const rawP = localStorage.getItem(LEGACY_PURCHASED_KEY);
    if (rawP) legacyPurchased = JSON.parse(rawP);
  } catch {}

  try {
    const rawW = localStorage.getItem(LEGACY_WISHLIST_KEY);
    if (rawW) legacyWishlist = JSON.parse(rawW);
  } catch {}

  if (legacyPurchased.length > 0 || legacyWishlist.length > 0) {
    const profile: Profile = {
      id: generateId(),
      name: "我的角色",
      purchased: legacyPurchased,
      wishlist: legacyWishlist,
      updatedAt: Date.now(),
    };
    store = {
      version: 1,
      activeProfileId: profile.id,
      profiles: [profile],
    };
  }
  // Legacy keys are NOT deleted (safety net)

  persist();
  updateSnapshots();
  notify();
}

// --- Subscribe (useSyncExternalStore) ---

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// --- Purchased ---

export function getPurchasedSnapshot(): Set<string> {
  return purchasedSnapshot;
}

export function togglePurchased(id: string) {
  const profile = ensureActiveProfile();

  const set = new Set(profile.purchased);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  profile.purchased = Array.from(set);
  touchActiveProfile();
  persist();
  updateSnapshots();
  notify();
}

// --- Wishlist ---

export function getWishlistSnapshot(): Set<string> {
  return wishlistSnapshot;
}

export function toggleWishlist(id: string) {
  const profile = ensureActiveProfile();

  const set = new Set(profile.wishlist);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  profile.wishlist = Array.from(set);
  touchActiveProfile();
  persist();
  updateSnapshots();
  notify();
}

// --- Profile CRUD ---

export function getProfiles(): Profile[] {
  return store.profiles;
}

export function getActiveProfileData(): Profile | null {
  return getActiveProfile();
}

export function getActiveProfileId(): string | null {
  return store.activeProfileId;
}

export function createProfile(name: string): Profile {
  const profile: Profile = {
    id: generateId(),
    name,
    purchased: [],
    wishlist: [],
    updatedAt: Date.now(),
  };
  store.profiles.push(profile);
  store.activeProfileId = profile.id;
  persist();
  updateSnapshots();
  notify();
  return profile;
}

export function switchProfile(id: string) {
  if (!store.profiles.some((p) => p.id === id)) return;
  store.activeProfileId = id;
  persist();
  updateSnapshots();
  notify();
}

export function deleteProfile(id: string) {
  store.profiles = store.profiles.filter((p) => p.id !== id);
  if (store.activeProfileId === id) {
    store.activeProfileId = store.profiles[0]?.id ?? null;
  }
  persist();
  updateSnapshots();
  notify();
}

export function renameProfile(id: string, name: string) {
  const profile = store.profiles.find((p) => p.id === id);
  if (!profile) return;
  profile.name = name;
  profile.updatedAt = Date.now();
  persist();
  notify();
}

// --- Sync support ---

export function mergeFromRemote(remote: Profile) {
  const idx = store.profiles.findIndex((p) => p.id === remote.id);
  if (idx >= 0) {
    if (remote.updatedAt > store.profiles[idx].updatedAt) {
      store.profiles[idx] = remote;
    }
  } else {
    store.profiles.push(remote);
  }
  persist();
  updateSnapshots();
  notify();
}

export function addImportedProfile(profile: Profile, setActive = false) {
  const copy = { ...profile, purchased: [...profile.purchased], wishlist: [...profile.wishlist] };
  const idx = store.profiles.findIndex((p) => p.id === copy.id);
  if (idx >= 0) {
    if (copy.updatedAt > store.profiles[idx].updatedAt) {
      store.profiles[idx] = copy;
    }
  } else {
    store.profiles.push(copy);
  }
  if (setActive) {
    store.activeProfileId = copy.id;
  }
  persist();
  updateSnapshots();
  notify();
}

// --- Export ---

export function exportActiveProfile(): Profile | null {
  return getActiveProfile() ? { ...getActiveProfile()! } : null;
}
