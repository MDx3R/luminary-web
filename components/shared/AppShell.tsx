"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ActivityBar } from "@/components/navigation/ActivityBar";
import { NavigationPanel } from "@/components/navigation/NavigationPanel";
import { Header } from "@/components/shared/Header";
import { SourcesPanel } from "@/components/sources/SourcesPanel";
import { AddSourceModal } from "@/components/sources/AddSourceModal";
import { useNavigationStore } from "@/store/useNavigationStore";

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_PANEL_MIN = "10";
const NAV_PANEL_DEFAULT = "15";
const NAV_PANEL_MAX = "20";

export function AppShell({ children }: AppShellProps) {
  const navigationPanelCollapsed = useNavigationStore(
    (s) => s.navigationPanelCollapsed
  );
  const toggleNavigationCollapsed = useNavigationStore(
    (s) => s.toggleNavigationCollapsed
  );
  const toggleChatPanelCollapsed = useNavigationStore(
    (s) => s.toggleChatPanelCollapsed
  );
  const navigationPanelSize = useNavigationStore((s) => s.navigationPanelSize);
  const setNavigationPanelSize = useNavigationStore(
    (s) => s.setNavigationPanelSize
  );

  const handleNavLayoutChanged = (layout: { [key: string]: number }) => {
    const navSize = layout["luminary-nav"];
    if (typeof navSize === "number") setNavigationPanelSize(navSize);
  };

  const navSizeClamped = Math.max(
    Number(NAV_PANEL_MIN),
    Math.min(Number(NAV_PANEL_DEFAULT), navigationPanelSize)
  );
  const defaultLayout = {
    "luminary-nav": navSizeClamped,
    "luminary-main": 100 - navSizeClamped,
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Header
        onToggleNavPanel={toggleNavigationCollapsed}
        onToggleChatPanel={toggleChatPanelCollapsed}
      />
      <div className="flex min-h-0 flex-1">
        <ActivityBar onToggleNavPanel={toggleNavigationCollapsed} />
        {navigationPanelCollapsed ? (
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
            {children}
          </main>
        ) : (
          <ResizablePanelGroup
            orientation="horizontal"
            id="luminary-nav-panel"
            className="min-w-0 flex-1 basis-0"
            defaultLayout={defaultLayout}
            onLayoutChanged={handleNavLayoutChanged}
          >
            <ResizablePanel
              id="luminary-nav"
              defaultSize={`${navigationPanelSize}%`}
              minSize={`${NAV_PANEL_MIN}%`}
              maxSize={`${NAV_PANEL_MAX}%`}
              className="min-w-0"
            >
              <NavigationPanel />
            </ResizablePanel>
            <ResizableHandle withHandle className="border-sidebar-border" />
            <ResizablePanel
              id="luminary-main"
              defaultSize={`${100 - navigationPanelSize}%`}
              minSize="30%"
              className="min-h-0 min-w-0 h-full flex flex-col"
            >
              <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  {children}
                </div>
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
      <SourcesPanel />
      <AddSourceModal />
    </div>
  );
}
