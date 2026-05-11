"use client";

import { Suspense } from "react";
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
import { AttachSourceModal } from "@/components/sources/AttachSourceModal";
import { SourceStatusPolling } from "@/components/sources/SourceStatusPolling";
import { AssistantsGlobalEditModal } from "@/components/assistants/AssistantsGlobalEditModal";
import { useNavigationStore, NAV_PANEL_MIN_PCT, NAV_PANEL_MAX_PCT } from "@/store/useNavigationStore";

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_PANEL_MIN = String(NAV_PANEL_MIN_PCT);
const NAV_PANEL_MAX = String(NAV_PANEL_MAX_PCT);

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

  const navSize = Math.max(
    NAV_PANEL_MIN_PCT,
    Math.min(NAV_PANEL_MAX_PCT, navigationPanelSize)
  );
  const defaultLayout = {
    "luminary-nav": navSize,
    "luminary-main": 100 - navSize,
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Suspense
        fallback={
          <div className="sticky top-0 z-40 h-11 w-full shrink-0 border-b border-sidebar-border bg-sidebar" />
        }
      >
        <Header
          onToggleNavPanel={toggleNavigationCollapsed}
          onToggleChatPanel={toggleChatPanelCollapsed}
        />
      </Suspense>
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
              defaultSize={`${navSize}%`}
              minSize={`${NAV_PANEL_MIN}%`}
              maxSize={`${NAV_PANEL_MAX}%`}
              className="min-w-0"
            >
              <NavigationPanel />
            </ResizablePanel>
            <ResizableHandle withHandle className="border-sidebar-border" />
            <ResizablePanel
              id="luminary-main"
              defaultSize={`${100 - navSize}%`}
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
      <SourceStatusPolling />
      <SourcesPanel />
      <AddSourceModal />
      <AttachSourceModal />
      <AssistantsGlobalEditModal />
    </div>
  );
}
