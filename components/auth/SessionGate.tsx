"use client";

import { Suspense, startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { InlineSpinner } from "@/components/shared/InlineSpinner";

/**
 * Guests may open /dashboard (login/register from Header). Other app routes
 * require an authenticated session.
 */
function isAuthWallPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/folder/")) return true;
  if (pathname.startsWith("/chat/")) return true;
  if (pathname.startsWith("/settings")) return true;
  return false;
}

function FullscreenBlockingLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background text-foreground">
      <InlineSpinner className="size-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Загрузка…</p>
    </div>
  );
}

function SessionGateInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sessionResolved = useAuthStore((s) => s.sessionResolved);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const bootstrapSession = useAuthStore((s) => s.bootstrapSession);
  const [persistReady, setPersistReady] = useState(
    () =>
      typeof window !== "undefined" &&
      useAuthStore.persist?.hasHydrated() === true
  );

  useEffect(() => {
    const p = useAuthStore.persist;
    if (!p) return;
    if (p.hasHydrated()) {
      startTransition(() => {
        setPersistReady(true);
      });
      void bootstrapSession();
      return;
    }
    return p.onFinishHydration(() => {
      startTransition(() => {
        setPersistReady(true);
      });
      void bootstrapSession();
    });
  }, [bootstrapSession]);

  useEffect(() => {
    if (!sessionResolved) return;
    if (!isLoggedIn && isAuthWallPath(pathname)) {
      router.replace("/");
      return;
    }
    if (isLoggedIn && pathname === "/") {
      router.replace("/dashboard");
    }
  }, [sessionResolved, isLoggedIn, pathname, router]);

  const guestBlocked = sessionResolved && !isLoggedIn && isAuthWallPath(pathname);
  const userRootRedirect = sessionResolved && isLoggedIn && pathname === "/";
  const validatingSession = persistReady && !sessionResolved;

  const blocking =
    !persistReady || validatingSession || guestBlocked || userRootRedirect;

  if (blocking) {
    return <FullscreenBlockingLoader />;
  }

  return <>{children}</>;
}

export function SessionGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<FullscreenBlockingLoader />}>
      <SessionGateInner>{children}</SessionGateInner>
    </Suspense>
  );
}
