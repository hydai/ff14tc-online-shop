"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  subscribe,
  getProfiles,
  getActiveProfileData,
  createProfile as storeCreate,
  switchProfile as storeSwitch,
  deleteProfile as storeDelete,
  renameProfile as storeRename,
} from "@/lib/profileStore";
import type { Profile } from "@/types";

const EMPTY_PROFILES: Profile[] = [];

export function useProfiles() {
  const profiles = useSyncExternalStore(subscribe, getProfiles, () => EMPTY_PROFILES);
  const activeProfile = useSyncExternalStore(subscribe, getActiveProfileData, () => null);

  const createProfile = useCallback((name: string) => {
    return storeCreate(name);
  }, []);

  const switchProfile = useCallback((id: string) => {
    storeSwitch(id);
  }, []);

  const deleteProfile = useCallback((id: string) => {
    storeDelete(id);
  }, []);

  const renameProfile = useCallback((id: string, name: string) => {
    storeRename(id, name);
  }, []);

  return {
    profiles,
    activeProfile,
    createProfile,
    switchProfile,
    deleteProfile,
    renameProfile,
  };
}
