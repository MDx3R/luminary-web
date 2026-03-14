import { FolderView } from "@/components/folder/FolderView";

interface FolderViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function FolderViewPage({ params }: FolderViewPageProps) {
  const { id } = await params;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1">
        <FolderView folderId={id} />
      </div>
    </div>
  );
}
