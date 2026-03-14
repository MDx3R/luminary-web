"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthApiError } from "@/lib/api-types";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Введите имя пользователя и пароль.");
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof AuthApiError ? err.message : "Не удалось войти. Попробуйте снова."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>Введите данные для входа в аккаунт</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="login-username" className="text-sm font-medium">
                Имя пользователя
              </label>
              <Input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium">
                Пароль
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Вход…" : "Войти"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{" "}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
