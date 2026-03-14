import { Router } from "express";
import { randomUUID } from "crypto";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prompts, claimTimers, expireTimers } from "../store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

mkdirSync(UPLOADS_DIR, { recursive: true });

const CLAIM_TTL_MS = 10 * 60 * 1000; // 10 minutes
const PROMPT_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

setInterval(() => {
  const now = new Date();
  for (const [id, prompt] of prompts.entries()) {
    if (prompt.status === "claimed" && prompt.claimExpiresAt && new Date(prompt.claimExpiresAt) < now) {
      prompt.status = "unclaimed";
      prompt.claimedBy = undefined;
      prompt.claimedAt = undefined;
      prompt.claimExpiresAt = undefined;
    } else if (prompt.status !== "completed" && prompt.status !== "expired" && new Date(prompt.expiresAt) < now) {
      prompt.status = "expired";
      prompt.claimedBy = undefined;
      prompt.claimedAt = undefined;
      prompt.claimExpiresAt = undefined;
    }
  }
});

export const router = Router();

function getUserId(req: Parameters<Router>[0]): string | undefined {
  const raw = req.headers["x-user-id"];
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

// POST /api/prompt/create - create a new prompt
router.post("/prompt/create", (req, res) => {
  const userId = getUserId(req);
  if (!userId) { res.status(400).json({ error: "Missing X-User-Id header" }); return; }

  const text: unknown = req.body?.text;
  if (typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" }); return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + PROMPT_TTL_MS);

  const promptId = randomUUID();
  const prompt = {
    id: promptId,
    text: text.trim(),
    createdBy: userId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "unclaimed" as const,
  };
  prompts.set(promptId, prompt);

  res.status(201).json(prompt);
});

// GET /api/prompts  — unclaimed prompts (excluding the requester's own)
router.get("/prompts", (req, res) => {
  const userId = getUserId(req);
  const list = [...prompts.values()]//.filter(
    // (p) => ((p.status === "unclaimed" && p.createdBy !== userId) || (p.status === "claimed" && p.claimedBy === userId))
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

// GET /api/prompts/:uuid  — all prompts created by a user
router.get("/prompts/:uuid", (req, res) => {
  const list = [...prompts.values()].filter(
    (p) => p.createdBy === req.params.uuid
  );
  res.json(list);
});

// GET /api/prompt/:prompt_id  — fetch single prompt by ID
router.get("/prompt/:prompt_id", (req, res) => {
  const promptId = req.params.prompt_id;
  const prompt = prompts.get(promptId);
  if (!prompt) { res.status(404).json({ error: "Prompt not found" }); return; }
  res.json(prompt);
});

// POST /api/prompt/claim/:prompt_id
router.post("/prompt/claim/:prompt_id", (req, res) => {
  const userId = getUserId(req);
  if (!userId) { res.status(400).json({ error: "Missing X-User-Id header" }); return; }

  const promptId = req.params.prompt_id;
  const prompt = prompts.get(promptId);
  if (!prompt) { res.status(404).json({ error: "Prompt not found" }); return; }
  if (prompt.status !== "unclaimed") { res.status(409).json({ error: "Prompt is not available" }); return; }

  const now = new Date();
  const claimExpiresAt = new Date(now.getTime() + CLAIM_TTL_MS);

  prompt.status = "claimed";
  prompt.claimedBy = userId;
  prompt.claimedAt = now.toISOString();
  prompt.claimExpiresAt = claimExpiresAt.toISOString();

  res.json(prompt);
});

// POST /api/prompt/:prompt_id/submit  — submit a canvas drawing
router.post("/prompt/:prompt_id/submit", (req, res) => {
  const userId = getUserId(req);
  if (!userId) { res.status(400).json({ error: "Missing X-User-Id header" }); return; }

  const promptId = req.params.prompt_id;
  const prompt = prompts.get(promptId);
  if (!prompt) { res.status(404).json({ error: "Prompt not found" }); return; }
  if (prompt.status !== "claimed") { res.status(409).json({ error: "Prompt is not currently claimed" }); return; }
  if (prompt.claimedBy !== userId) { res.status(403).json({ error: "You have not claimed this prompt" }); return; }

  const imageData: unknown = req.body?.imageData;
  if (typeof imageData !== "string") { res.status(400).json({ error: "imageData is required" }); return; }

  const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
  const filename = `${promptId}.png`;
  writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(base64, "base64"));

  const claimTimer = claimTimers.get(promptId);
  if (claimTimer) { clearTimeout(claimTimer); claimTimers.delete(promptId); }

  const expireTimer = expireTimers.get(promptId);
  if (expireTimer) { clearTimeout(expireTimer); expireTimers.delete(promptId); }

  prompt.status = "completed";
  prompt.drawingFile = filename;
  prompt.completedAt = new Date().toISOString();

  res.json(prompt);
});
