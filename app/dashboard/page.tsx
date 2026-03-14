import { FolderOpen } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
        <FolderOpen className="size-6" />
        Папки
      </h1>
      <p className="text-muted-foreground">
        Здесь будет список ваших папок (workspaces). Создайте папку, чтобы
        начать работу с источниками, чатами и редактором.
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        Список папок пока пуст
      </div>
    </div>
  );
}
