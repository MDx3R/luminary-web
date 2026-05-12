import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
        <SettingsIcon className="size-6" />
        Настройки
      </h1>
      <p className="text-muted-foreground">
        Настройки приложения и профиля появятся здесь.
      </p>
    </div>
  );
}
