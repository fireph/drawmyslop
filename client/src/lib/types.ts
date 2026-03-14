export type PromptStatus = "unclaimed" | "claimed" | "completed" | "expired";

export interface Prompt {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  status: PromptStatus;
  claimedBy?: string;
  claimedAt?: string;
  claimExpiresAt?: string;
  drawingFile?: string;
  completedAt?: string;
}
