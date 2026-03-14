import type { Prompt } from "./types.js";

// All prompts keyed by id
export const prompts = new Map<string, Prompt>();

// Active unclaim timers keyed by prompt id
export const claimTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Active expire timers keyed by prompt id
export const expireTimers = new Map<string, ReturnType<typeof setTimeout>>();
