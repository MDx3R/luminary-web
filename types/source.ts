export type SourceKind = "file" | "url";

export type SourceStatus = "indexed" | "processing";

export interface Source {
  id: string;
  folderId: string;
  kind: SourceKind;
  title: string;
  status: SourceStatus;
  fileName?: string;
  mimeType?: string;
  url?: string;
}
