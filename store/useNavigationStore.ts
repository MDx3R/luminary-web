import { create } from "zustand"

export type ActivitySection = "files" | "search" | "assistants" | "sources"

interface NavigationState {
  activeSection: ActivitySection
  navigationPanelCollapsed: boolean
  navigationPanelSize: number
  expandedFolderIds: string[]

  setActiveSection: (section: ActivitySection) => void
  toggleNavigationCollapsed: () => void
  setNavigationPanelSize: (size: number) => void
  toggleFolderExpanded: (folderId: string) => void
  collapseAllFolders: () => void
}

const DEFAULT_NAV_PANEL_SIZE = 20

export const useNavigationStore = create<NavigationState>()((set) => ({
  activeSection: "files",
  navigationPanelCollapsed: false,
  navigationPanelSize: DEFAULT_NAV_PANEL_SIZE,
  expandedFolderIds: [],

  setActiveSection(section) {
    set({ activeSection: section })
  },

  toggleNavigationCollapsed() {
    set((s) => ({ navigationPanelCollapsed: !s.navigationPanelCollapsed }))
  },

  setNavigationPanelSize(size) {
    set({ navigationPanelSize: Math.max(0, Math.min(100, size)) })
  },

  toggleFolderExpanded(folderId) {
    set((s) => ({
      expandedFolderIds: s.expandedFolderIds.includes(folderId)
        ? s.expandedFolderIds.filter((id) => id !== folderId)
        : [...s.expandedFolderIds, folderId],
    }))
  },

  collapseAllFolders() {
    set({ expandedFolderIds: [] })
  },
}))
