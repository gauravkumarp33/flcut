import { z } from "zod";

export const reservedSlugs = new Set([
  "dashboard",
  "api",
  "login",
  "expired",
  "admin",
]);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

export function generateShortSlug() {
  return Math.random().toString(36).slice(2, 8);
}

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "Destination URL is required.")
    .url("Enter a valid URL.")
    .refine((value) => {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    }, "Only http and https URLs are allowed."),
  slug: z
    .string()
    .transform(normalizeSlug)
    .refine((value) => value.length >= 3, "Slug must be at least 3 characters.")
    .refine((value) => value.length <= 48, "Slug must be 48 characters or less.")
    .refine(
      (value) => slugPattern.test(value),
      "Use lowercase letters, numbers, and single hyphens only.",
    )
    .refine((value) => !reservedSlugs.has(value), "That slug is reserved.")
    .optional(),
  title: z.string().trim().max(120, "Title must be 120 characters or less.").optional(),
  eventName: z
    .string()
    .trim()
    .max(120, "Event name must be 120 characters or less.")
    .optional(),
  channel: z
    .string()
    .trim()
    .max(60, "Channel must be 60 characters or less.")
    .optional(),
  expiresAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid expiry date.")
    .transform((value) => new Date(value))
    .refine((value) => value > new Date(), "Expiry must be in the future.")
    .optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
