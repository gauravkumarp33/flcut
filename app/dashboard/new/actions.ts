"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import {
  createLinkSchema,
  generateShortSlug,
  normalizeOptionalText,
  reservedSlugs,
} from "./validation";

export type CreateLinkFormState = {
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

const maxSlugAttempts = 8;

function formDataToInput(formData: FormData) {
  return {
    originalUrl: normalizeOptionalText(formData.get("originalUrl")) ?? "",
    slug: normalizeOptionalText(formData.get("slug")),
    title: normalizeOptionalText(formData.get("title")),
    eventName: normalizeOptionalText(formData.get("eventName")),
    channel: normalizeOptionalText(formData.get("channel")),
    expiresAt: normalizeOptionalText(formData.get("expiresAt")),
  };
}

function zodErrorsToFieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}) {
  const { fieldErrors } = error.flatten();

  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [
      field,
      messages[0],
    ]),
  );
}

async function slugExists(slug: string) {
  const existingLink = await prisma.link.findUnique({
    where: { slug },
    select: { id: true },
  });

  return Boolean(existingLink);
}

async function createAvailableSlug() {
  for (let attempt = 0; attempt < maxSlugAttempts; attempt += 1) {
    const slug = generateShortSlug();

    if (!reservedSlugs.has(slug) && !(await slugExists(slug))) {
      return slug;
    }
  }

  throw new Error("Unable to generate an available slug.");
}

export async function createLinkAction(
  _previousState: CreateLinkFormState,
  formData: FormData,
): Promise<CreateLinkFormState> {
  const parsed = createLinkSchema.safeParse(formDataToInput(formData));

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: zodErrorsToFieldErrors(parsed.error),
    };
  }

  const slug = parsed.data.slug ?? (await createAvailableSlug());

  if (await slugExists(slug)) {
    return {
      message: "Please choose another slug.",
      fieldErrors: {
        slug: "That slug is already in use.",
      },
    };
  }

  try {
    await prisma.link.create({
      data: {
        slug,
        originalUrl: parsed.data.originalUrl,
        title: parsed.data.title,
        eventName: parsed.data.eventName,
        channel: parsed.data.channel,
        expiresAt: parsed.data.expiresAt,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        message: "Please choose another slug.",
        fieldErrors: {
          slug: "That slug is already in use.",
        },
      };
    }

    console.error("Failed to create link", error);

    return {
      message: "The link could not be created. Please try again.",
    };
  }

  redirect(`/dashboard/new?created=${encodeURIComponent(slug)}`);
}
