export interface AssistantSummary {
  id: string;
  name: string;
  description: string;
  type: string;
  tags: string[];
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  type: string;
  prompt: string;
  created_at: string;
  tags: string[];
}
