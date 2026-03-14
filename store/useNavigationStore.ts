import { create } from "zustand"

export type ActivitySection = "files" | "search" | "assistants" | "sources"

export type AccordionSectionId = "folders" | "standalone"

interface NavigationState {
  activeSection: ActivitySection
  navigationPanelCollapsed: boolean
  navigationPanelSize: number
  chatPanelCollapsed: boolean
  expandedFolderIds: string[]
  expandedAccordionSections: AccordionSectionId[]

  setActiveSection: (section: ActivitySection) => void
  toggleNavigationCollapsed: () => void
  setNavigationPanelSize: (size: number) => void
  toggleChatPanelCollapsed: () => void
  toggleFolderExpanded: (folderId: string) => void
  toggleAccordionSection: (section: AccordionSectionId) => void
  setExpandedAccordionSections: (sections: AccordionSectionId[]) => void
  collapseAllFolders: () => void
}

export const NAV_PANEL_DEFAULT_SIZE = 22
const DEFAULT_ACCORDION_OPEN: AccordionSectionId[] = ["folders", "standalone"]

export const useNavigationStore = create<NavigationState>()((set) => ({
  activeSection: "files",
  navigationPanelCollapsed: false,
  navigationPanelSize: NAV_PANEL_DEFAULT_SIZE,
  chatPanelCollapsed: false,
  expandedFolderIds: [],
  expandedAccordionSections: DEFAULT_ACCORDION_OPEN,

  setActiveSection(section) {
    set({ activeSection: section })
  },

  toggleNavigationCollapsed() {
    set((s) => ({ navigationPanelCollapsed: !s.navigationPanelCollapsed }))
  },

  setNavigationPanelSize(size) {
    set({ navigationPanelSize: Math.max(0, Math.min(100, size)) })
  },

  toggleChatPanelCollapsed() {
    set((s) => ({ chatPanelCollapsed: !s.chatPanelCollapsed }))
  },

  toggleFolderExpanded(folderId) {
    set((s) => ({
      expandedFolderIds: s.expandedFolderIds.includes(folderId)
        ? s.expandedFolderIds.filter((id) => id !== folderId)
        : [...s.expandedFolderIds, folderId],
    }))
  },

  toggleAccordionSection(section) {
    set((s) => ({
      expandedAccordionSections: s.expandedAccordionSections.includes(section)
        ? s.expandedAccordionSections.filter((id) => id !== section)
        : [...s.expandedAccordionSections, section],
    }))
  },

  setExpandedAccordionSections(sections) {
    set({ expandedAccordionSections: sections })
  },

  collapseAllFolders() {
    set({
      expandedFolderIds: [],
      expandedAccordionSections: [],
    })
  },
}))
