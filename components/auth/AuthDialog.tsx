"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthApiError } from "@/lib/api-types";

type AuthMode = "login" | "register";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
}

export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "login",
}: AuthDialogProps) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === "login";

  useEffect(() => {
    if (open) setMode(defaultMode);
  }, [open, defaultMode]);

  function resetForm() {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setMode(defaultMode);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Введите имя пользователя и пароль.");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      handleOpenChange(false);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : isLogin
            ? "Не удалось войти. Попробуйте снова."
            : "Не удалось зарегистрироваться. Попробуйте снова."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>{isLogin ? "Вход" : "Регистрация"}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Введите данные для входа в аккаунт"
              : "Создайте аккаунт для входа"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="space-y-4 pt-0 pb-2">
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <label htmlFor="auth-username" className="text-sm font-medium">
                  Имя пользователя
                </label>
                <Input
                  id="auth-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="auth-password" className="text-sm font-medium">
                  Пароль
                </label>
                <PasswordInput
                  id="auth-password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="auth-confirm" className="text-sm font-medium">
                    Повторите пароль
                  </label>
                  <PasswordInput
                    id="auth-confirm"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-4 border-t border-border mt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? isLogin
                    ? "Вход…"
                    : "Регистрация…"
                  : isLogin
                    ? "Войти"
                    : "Зарегистрироваться"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {isLogin ? (
                  <>
                    Нет аккаунта?{" "}
                    <button
                      type="button"
                      className="text-primary underline-offset-4 hover:underline"
                      onClick={() => {
                        setMode("register");
                        setError(null);
                      }}
                    >
                      Зарегистрироваться
                    </button>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт?{" "}
                    <button
                      type="button"
                      className="text-primary underline-offset-4 hover:underline"
                      onClick={() => {
                        setMode("login");
                        setError(null);
                      }}
                    >
                      Войти
                    </button>
                  </>
                )}
              </p>
            </CardFooter>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}
