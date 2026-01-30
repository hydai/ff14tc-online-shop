"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getProfile, putProfile } from "@/lib/syncApi";
import {
  subscribe,
  getActiveProfileData,
  mergeFromRemote,
} from "@/lib/profileStore";

export type SyncStatus = "synced" | "syncing" | "error" | "offline";

const DEBOUNCE_MS = 2000;

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>("offline");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushedAtRef = useRef<number>(0);

  const pull = useCallback(async () => {
    const profile = getActiveProfileData();
    if (!profile) return;

    setStatus("syncing");
    try {
      const remote = await getProfile(profile.id);
      if (remote && remote.updatedAt > profile.updatedAt) {
        mergeFromRemote(remote);
      }
      setStatus("synced");
    } catch {
      setStatus("error");
    }
  }, []);

  const push = useCallback(async () => {
    const profile = getActiveProfileData();
    if (!profile) return;

    setStatus("syncing");
    try {
      const ok = await putProfile(profile);
      if (ok) {
        lastPushedAtRef.current = profile.updatedAt;
        setStatus("synced");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, []);

  // Push on store change (debounced)
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const profile = getActiveProfileData();
      if (!profile) return;
      // Only push if the profile has been updated since last push
      if (profile.updatedAt <= lastPushedAtRef.current) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        push();
      }, DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [push]);

  // Pull on mount + window focus
  useEffect(() => {
    pull();

    function handleFocus() {
      pull();
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [pull]);

  return { syncStatus: status, pull, push };
}
