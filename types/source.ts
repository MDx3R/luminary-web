export type SourceType = "file" | "link" | "page";

export type SourceFetchStatus =
  | "not_fetched"
  | "fetched"
  | "embedded"
  | "failed";

export interface Source {
  id: string;
  title: string;
  type: SourceType;
  fetch_status: SourceFetchStatus;
  created_at: string;
  url?: string | null;
  file_id?: string | null;
  editable?: boolean | null;
}

/** Same shape as Source for items nested in folder/chat responses */
export interface FolderSourceItem {
  id: string;
  title: string;
  type: string;
  fetch_status: string;
  url: string | null;
  file_id: string | null;
  editable: boolean | null;
}

export interface ChatSourceItem {
  id: string;
  title: string;
  type: string;
  fetch_status: string;
  url: string | null;
  file_id: string | null;
  editable: boolean | null;
}
