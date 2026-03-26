import { create } from "zustand"

interface UiState {
  readonly sidebarOpen: boolean
  readonly toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
