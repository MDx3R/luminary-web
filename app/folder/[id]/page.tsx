import { FileText, MessageSquare } from "lucide-react";

interface FolderViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function FolderViewPage({ params }: FolderViewPageProps) {
  const { id } = await params;

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-2xl font-semibold">Папка {id}</h1>
      <div className="flex flex-1 gap-4">
        <section className="flex flex-1 flex-col rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <FileText className="size-4" />
            <span className="font-medium">Редактор</span>
          </div>
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Область редактора (Tiptap) будет здесь
          </div>
        </section>
        <section className="flex w-80 flex-col rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <MessageSquare className="size-4" />
            <span className="font-medium">Чат</span>
          </div>
          <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
            Область чата будет здесь
          </div>
        </section>
      </div>
    </div>
  );
}
