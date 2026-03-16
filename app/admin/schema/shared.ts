import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9-]+$/;
export const slugField = z.string().min(1, "Slug is required").regex(SLUG_REGEX, "Lowercase letters, numbers, and hyphens only");

export const AUTO_FIELDS = ["id", "createdAt", "updatedAt"] as const;

export const i18nRecord = z.record(z.string(), z.string().nullable().optional()).optional();
