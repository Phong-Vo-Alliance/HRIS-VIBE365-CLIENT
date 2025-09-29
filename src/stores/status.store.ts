import { create } from "zustand";

/**
 * Minimal stub to satisfy LoginPage import in the template.
 * Extend/replace with real status tracking later.
 */
type StatusStore = {
  addLoginEntry: () => void;
  addLogoutEntry: () => void;
};

export const useStatusStore = create<StatusStore>(() => ({
  addLoginEntry: () => {
    // no-op in template
  },

  addLogoutEntry: () => {
    // no-op in template
  },
}));
