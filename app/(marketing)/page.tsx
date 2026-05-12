import { Suspense } from "react";
import { WelcomePage } from "@/components/marketing/WelcomePage";
import { InlineSpinner } from "@/components/shared/InlineSpinner";

function WelcomeFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <InlineSpinner className="size-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Загрузка…</p>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<WelcomeFallback />}>
      <WelcomePage />
    </Suspense>
  );
}
