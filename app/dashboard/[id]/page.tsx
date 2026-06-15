import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

type LinkDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ClickEventSummary = {
  visitedAt: Date;
  referrer: string | null;
  userAgent: string | null;
  visitorId: string | null;
  isUnique: boolean;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

function formatDate(date: Date | null) {
  return date ? dateTimeFormatter.format(date) : "No expiry";
}

function getStatus(link: { isActive: boolean; expiresAt: Date | null }) {
  if (!link.isActive) {
    return {
      label: "Inactive",
      className: "border-zinc-200 bg-zinc-100 text-zinc-700",
    };
  }

  if (link.expiresAt && link.expiresAt <= new Date()) {
    return {
      label: "Expired",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  return {
    label: "Active",
    className: "border-teal-200 bg-teal-50 text-teal-800",
  };
}

function getReferrerLabel(referrer: string | null) {
  if (!referrer) {
    return "Direct or unknown";
  }

  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

function getDeviceHint(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown";
  }

  const normalized = userAgent.toLowerCase();

  if (normalized.includes("mobile")) {
    return "Mobile";
  }

  if (normalized.includes("tablet") || normalized.includes("ipad")) {
    return "Tablet";
  }

  if (normalized.includes("bot") || normalized.includes("crawler")) {
    return "Bot or crawler";
  }

  return "Desktop";
}

function buildDailySummary(clicks: ClickEventSummary[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: dayFormatter.format(date),
      clicks: 0,
    };
  });
  const byDay = new Map(days.map((day) => [day.key, day]));

  for (const click of clicks) {
    const dayKey = click.visitedAt.toISOString().slice(0, 10);
    const day = byDay.get(dayKey);

    if (day) {
      day.clicks += 1;
    }
  }

  return days;
}

function countByLabel(
  clicks: ClickEventSummary[],
  getLabel: (click: ClickEventSummary) => string,
) {
  const counts = new Map<string, number>();

  for (const click of clicks) {
    const label = getLabel(click);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts, ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function MiniBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width = max > 0 ? `${Math.max((value / max) * 100, 6)}%` : "0%";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="truncate text-zinc-700">{label}</span>
        <span className="font-semibold text-zinc-950">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-100">
        <div className="h-2 rounded-full bg-teal-700" style={{ width }} />
      </div>
    </div>
  );
}

export default async function LinkDetailPage({ params }: LinkDetailPageProps) {
  const { id } = await params;
  const link = await prisma.link.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    select: {
      id: true,
      slug: true,
      originalUrl: true,
      title: true,
      eventName: true,
      channel: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      expiresAt: true,
      clickCount: true,
      uniqueClickCount: true,
      clicks: {
        orderBy: {
          visitedAt: "desc",
        },
        take: 200,
        select: {
          visitedAt: true,
          referrer: true,
          userAgent: true,
          visitorId: true,
          isUnique: true,
        },
      },
    },
  });

  if (!link) {
    notFound();
  }

  const status = getStatus(link);
  const recentClicks = link.clicks.slice(0, 12);
  const dailySummary = buildDailySummary(link.clicks);
  const maxDailyClicks = Math.max(...dailySummary.map((day) => day.clicks), 0);
  const referrerSummary = countByLabel(link.clicks, (click) =>
    getReferrerLabel(click.referrer),
  );
  const deviceSummary = countByLabel(link.clicks, (click) =>
    getDeviceHint(click.userAgent),
  );
  const maxReferrerClicks = Math.max(
    ...referrerSummary.map((item) => item.count),
    0,
  );
  const maxDeviceClicks = Math.max(
    ...deviceSummary.map((item) => item.count),
    0,
  );

  return (
    <AppShell title={`/${link.slug}`} eyebrow="Link analytics" showLogout>
      <div className="space-y-6">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-all text-2xl font-semibold text-zinc-950">
                  /{link.slug}
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
              <p className="mt-3 break-all text-sm text-zinc-600">
                {link.originalUrl}
              </p>
            </div>
            <Link
              href={`/${link.slug}`}
              className="rounded-md bg-teal-700 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Open public link
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-zinc-500">Title</p>
              <p className="mt-1 text-zinc-950">{link.title ?? "Untitled"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Event</p>
              <p className="mt-1 text-zinc-950">
                {link.eventName ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Channel</p>
              <p className="mt-1 text-zinc-950">{link.channel ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Created</p>
              <p className="mt-1 text-zinc-950">{formatDate(link.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Expires</p>
              <p className="mt-1 text-zinc-950">{formatDate(link.expiresAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Updated</p>
              <p className="mt-1 text-zinc-950">{formatDate(link.updatedAt)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Total clicks</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">
              {link.clickCount}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Unique clicks</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">
              {link.uniqueClickCount}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Clicks over time
            </h2>
            <div className="mt-5 space-y-4">
              {dailySummary.map((day) => (
                <MiniBar
                  key={day.key}
                  label={day.label}
                  value={day.clicks}
                  max={maxDailyClicks}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Referrers</h2>
            <div className="mt-5 space-y-4">
              {referrerSummary.length > 0 ? (
                referrerSummary.map((item) => (
                  <MiniBar
                    key={item.label}
                    label={item.label}
                    value={item.count}
                    max={maxReferrerClicks}
                  />
                ))
              ) : (
                <p className="text-sm text-zinc-600">
                  No referrer data has been captured yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Device hints
            </h2>
            <div className="mt-5 space-y-4">
              {deviceSummary.length > 0 ? (
                deviceSummary.map((item) => (
                  <MiniBar
                    key={item.label}
                    label={item.label}
                    value={item.count}
                    max={maxDeviceClicks}
                  />
                ))
              ) : (
                <p className="text-sm text-zinc-600">
                  No user agent data has been captured yet.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-zinc-950">
              Recent click events
            </h2>
            <p className="text-sm text-zinc-500">
              Showing the latest {recentClicks.length} events
            </p>
          </div>

          <div className="mt-5 divide-y divide-zinc-100">
            {recentClicks.length > 0 ? (
              recentClicks.map((click) => (
                <div
                  key={`${click.visitedAt.toISOString()}-${click.visitorId ?? "unknown"}`}
                  className="grid gap-3 py-4 text-sm sm:grid-cols-[180px_1fr_140px_120px]"
                >
                  <p className="font-medium text-zinc-950">
                    {formatDate(click.visitedAt)}
                  </p>
                  <p className="break-all text-zinc-600">
                    {getReferrerLabel(click.referrer)}
                  </p>
                  <p className="text-zinc-600">
                    {getDeviceHint(click.userAgent)}
                  </p>
                  <p className="font-medium text-zinc-950">
                    {click.isUnique ? "Unique" : "Repeat"}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-sm text-zinc-600">
                No clicks have been recorded for this link yet.
              </p>
            )}
          </div>
        </section>

        <Link
          href="/dashboard"
          className="inline-flex rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white"
        >
          Back to dashboard
        </Link>
      </div>
    </AppShell>
  );
}
