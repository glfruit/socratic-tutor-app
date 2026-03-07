import { create } from "zustand";
import { preferenceService } from "@/services/preferenceService";
import { useAuthStore } from "@/stores/authStore";
import { DEFAULT_LEARNING_LEVEL } from "@/utils/learningLevel";
import type { LearningLevel, ThemePreference, UserPreferences } from "@/types";

interface PreferencesState extends UserPreferences {
  isLoading: boolean;
  loadPreferences: () => Promise<void>;
  setDefaultLevel: (level: LearningLevel) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
}

const applyTheme = (theme: ThemePreference) => {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme !== "system") {
    root.classList.add(theme);
  }
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  defaultLevel: DEFAULT_LEARNING_LEVEL,
  theme: "system",
  isLoading: false,

  async loadPreferences() {
    set({ isLoading: true });
    const preferences = await preferenceService.getPreferences();
    applyTheme(preferences.theme);
    useAuthStore.getState().setPreferences(preferences);
    set({ ...preferences, isLoading: false });
  },

  async setDefaultLevel(level) {
    const preferences = await preferenceService.updatePreferences({ defaultLevel: level });
    useAuthStore.getState().setPreferences(preferences);
    set({ defaultLevel: preferences.defaultLevel });
  },

  async setTheme(theme) {
    const preferences = await preferenceService.updatePreferences({ theme });
    applyTheme(preferences.theme);
    useAuthStore.getState().setPreferences(preferences);
    set({ theme: preferences.theme });
  }
}));
