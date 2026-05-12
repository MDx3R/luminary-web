"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Layers, MessageSquare, PenLine, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login" || auth === "register") {
      router.replace(`/dashboard?auth=${auth}`, { scroll: false });
    }
  }, [router, searchParams]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-4 px-4 md:px-6">
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            Luminary
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard?auth=login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Войти
            </Link>
            <Link
              href="/dashboard?auth=register"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-16 px-4 py-14 md:px-6 md:py-20">
        <section className="space-y-6 border-l-2 border-muted-foreground/30 pl-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Human-centric workspace
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
            Пишите сами.
            <br />
            <span className="text-muted-foreground">ИИ — второй пилот.</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Luminary — это рабочее пространство вокруг{" "}
            <strong className="font-medium text-foreground">вашего текста</strong>
            : источники и контекст папки заземляют ответы ассистента, а{" "}
            <strong className="font-medium text-foreground">редактор Markdown</strong>{" "}
            остаётся источником правды — от сбора материалов к финальному документу.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/dashboard?auth=register"
              className={cn(buttonVariants({ variant: "default", size: "default" }))}
            >
              Начать
            </Link>
            <Link
              href="/dashboard?auth=login"
              className={cn(buttonVariants({ variant: "outline", size: "default" }))}
            >
              Уже есть аккаунт
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-lg border border-border bg-card/40 p-5 shadow-sm">
            <Sparkles className="mb-3 size-5 text-muted-foreground" />
            <h2 className="mb-2 font-medium text-foreground">User-led, AI-augmented</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Основной объём текста создаёте вы. ИИ подключается для синтеза из источников,
              структуры и опоры — без «призрака пера».
            </p>
          </article>
          <article className="rounded-lg border border-border bg-card/40 p-5 shadow-sm">
            <Layers className="mb-3 size-5 text-muted-foreground" />
            <h2 className="mb-2 font-medium text-foreground">Контекст, как в NotebookLM</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ответы и подсказки опираются на загруженные источники и папку: фактическая
              точность важнее свободной фантазии модели.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-card/40 p-5 shadow-sm">
            <PenLine className="mb-3 size-5 text-muted-foreground" />
            <h2 className="mb-2 font-medium text-foreground">Редактор — центр</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Чаты и ассистенты работают на наполнение и улучшение документа в редакторе,
              а не заменяют его.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-card/40 p-5 shadow-sm">
            <MessageSquare className="mb-3 size-5 text-muted-foreground" />
            <h2 className="mb-2 font-medium text-foreground">Плавный путь</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              От источников к обсуждению в чате и к финальному синтезу в Markdown — без
              потери контекста.
            </p>
          </article>
        </section>

        <section className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-8">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Внутри Luminary</p>
              <ul className="list-inside list-disc space-y-1 leading-relaxed">
                <li>
                  <strong className="font-medium text-foreground">Папки</strong> — контекст,
                  источники, редактор и чаты.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Чаты</strong> — в папке с
                  её источниками или автономные.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Ассистенты</strong> — ваши,
                  системные и из библиотеки.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
