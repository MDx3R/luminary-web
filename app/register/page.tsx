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

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Введите имя пользователя и пароль.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }
    setIsLoading(true);
    try {
      await register(username.trim(), password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof AuthApiError ? err.message : "Не удалось зарегистрироваться. Попробуйте снова."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>Создайте аккаунт для входа</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="register-username" className="text-sm font-medium">
                Имя пользователя
              </label>
              <Input
                id="register-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="register-password" className="text-sm font-medium">
                Пароль
              </label>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="register-confirm" className="text-sm font-medium">
                Повторите пароль
              </label>
              <Input
                id="register-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Регистрация…" : "Зарегистрироваться"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Войти
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
