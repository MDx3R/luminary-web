"use client";

import { useCallback } from "react";
import { usePanelRef } from "react-resizable-panels";
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

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_PANEL_MIN = "10";
const NAV_PANEL_MAX = "25";
const NAV_PANEL_DEFAULT = "15";

export function AppShell({ children }: AppShellProps) {
  const navPanelRef = usePanelRef();

  const handleToggleNavPanel = useCallback(() => {
    if (!navPanelRef.current) return;
    if (navPanelRef.current.isCollapsed()) {
      navPanelRef.current.expand();
    } else {
      navPanelRef.current.collapse();
    }
  }, [navPanelRef]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ActivityBar onToggleNavPanel={handleToggleNavPanel} />
      <ResizablePanelGroup
        orientation="horizontal"
        id="luminary-nav-panel"
        className="min-w-0 flex-1 basis-0"
      >
        <ResizablePanel
          panelRef={navPanelRef}
          defaultSize={NAV_PANEL_DEFAULT}
          minSize={NAV_PANEL_MIN}
          maxSize={NAV_PANEL_MAX}
          collapsedSize="0"
          collapsible
          className="min-w-0"
        >
          <NavigationPanel />
        </ResizablePanel>
        <ResizableHandle withHandle className="border-sidebar-border" />
        <ResizablePanel defaultSize="80" minSize="50" className="min-w-0">
          <main className="flex h-full flex-1 flex-col overflow-auto">
            <Header />
            <div className="flex min-h-0 flex-1 flex-col overflow-auto">
              {children}
            </div>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
      <SourcesPanel />
      <AddSourceModal />
    </div>
  );
}
