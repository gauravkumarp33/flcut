import { createHash, randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";

export const dynamic = "force-dynamic";

type PublicLinkRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

const visitorCookieName = "flcut_vid";
const uniqueWindowMs = 24 * 60 * 60 * 1000;

function messagePage({
  title,
  eyebrow,
  message,
  status,
}: {
  title: string;
  eyebrow: string;
  message: string;
  status: number;
}) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | FLCut</title>
    <style>
      body {
        align-items: center;
        background: #fafaf9;
        color: #09090b;
        display: flex;
        font-family: Arial, Helvetica, sans-serif;
        justify-content: center;
        margin: 0;
        min-height: 100vh;
        padding: 24px;
      }

      main {
        background: #ffffff;
        border: 1px solid #e4e4e7;
        border-radius: 8px;
        box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
        max-width: 420px;
        padding: 24px;
        width: 100%;
      }

      a {
        text-decoration: none;
      }

      .brand {
        color: #09090b;
        font-size: 20px;
        font-weight: 700;
      }

      .eyebrow {
        color: #0f766e;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        margin: 32px 0 8px;
        text-transform: uppercase;
      }

      h1 {
        font-size: 28px;
        line-height: 1.2;
        margin: 0 0 12px;
      }

      p {
        color: #52525b;
        font-size: 14px;
        line-height: 1.7;
        margin: 0 0 24px;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .button {
        background: #0f766e;
        border-radius: 6px;
        color: white;
        display: inline-block;
        font-size: 14px;
        font-weight: 700;
        padding: 10px 16px;
      }

      .secondary {
        background: #ffffff;
        border: 1px solid #d4d4d8;
        color: #3f3f46;
      }
    </style>
  </head>
  <body>
    <main>
      <a class="brand" href="/">FLCut</a>
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="actions">
        <a class="button" href="/">Go home</a>
        <a class="button secondary" href="/login">Dashboard login</a>
      </div>
    </main>
  </body>
</html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
}

function isExpired(expiresAt: Date | null) {
  return Boolean(expiresAt && expiresAt <= new Date());
}

function getSafeDestination(originalUrl: string) {
  try {
    const url = new URL(originalUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function hashIp(ipAddress: string | null) {
  if (!ipAddress) {
    return null;
  }

  return createHash("sha256").update(ipAddress).digest("hex");
}

function getRequestMetadata(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;

  return {
    referrer: request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
    ipHash: hashIp(ipAddress),
  };
}

async function recordVisit(
  linkId: string,
  visitorId: string,
  request: NextRequest,
) {
  const uniqueSince = new Date(Date.now() - uniqueWindowMs);
  const recentClick = await prisma.clickEvent.findFirst({
    where: {
      linkId,
      visitorId,
      visitedAt: {
        gte: uniqueSince,
      },
    },
    select: {
      id: true,
    },
  });
  const isUnique = !recentClick;
  const requestMetadata = getRequestMetadata(request);

  await prisma.$transaction([
    prisma.clickEvent.create({
      data: {
        linkId,
        visitorId,
        isUnique,
        ...requestMetadata,
      },
    }),
    prisma.link.update({
      where: {
        id: linkId,
      },
      data: {
        clickCount: {
          increment: 1,
        },
        uniqueClickCount: {
          increment: isUnique ? 1 : 0,
        },
      },
    }),
  ]);
}

export async function GET(
  request: NextRequest,
  { params }: PublicLinkRouteContext,
) {
  const { slug } = await params;
  const link = await prisma.link.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      originalUrl: true,
      isActive: true,
      expiresAt: true,
    },
  });

  if (!link) {
    return messagePage({
      title: "Link not found",
      eyebrow: "Missing short link",
      message:
        "This FLCut link does not exist. It may have been removed, renamed, or typed incorrectly.",
      status: 404,
    });
  }

  if (!link.isActive || isExpired(link.expiresAt)) {
    return messagePage({
      title: "Link expired",
      eyebrow: "No longer active",
      message:
        "This FLCut link is no longer active, so we did not redirect you. Please ask the club team for an updated link.",
      status: 410,
    });
  }

  const destination = getSafeDestination(link.originalUrl);

  if (!destination) {
    return messagePage({
      title: "Link unavailable",
      eyebrow: "Invalid destination",
      message:
        "This FLCut link points to an invalid destination, so we stopped before redirecting.",
      status: 400,
    });
  }

  const existingVisitorId = request.cookies.get(visitorCookieName)?.value;
  const visitorId = existingVisitorId ?? randomUUID();

  await recordVisit(link.id, visitorId, request);

  const response = NextResponse.redirect(destination);

  if (!existingVisitorId) {
    response.cookies.set(visitorCookieName, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 400,
      path: "/",
    });
  }

  return response;
}
