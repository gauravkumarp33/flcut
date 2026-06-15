import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(date: Date | null) {
  return date ? dateFormatter.format(date) : "No expiry";
}

function getLinkStatus(link: { isActive: boolean; expiresAt: Date | null }) {
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

function buildSearchWhere(query: string): Prisma.LinkWhereInput | undefined {
  if (!query) {
    return undefined;
  }

  return {
    OR: [
      { slug: { contains: query, mode: "insensitive" } },
      { eventName: { contains: query, mode: "insensitive" } },
      { channel: { contains: query, mode: "insensitive" } },
    ],
  };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { q, sort } = await searchParams;
  const query = q?.trim() ?? "";
  const sortMode = sort === "most-clicked" ? "most-clicked" : "newest";
  const where = buildSearchWhere(query);
  const orderBy =
    sortMode === "most-clicked"
      ? [{ clickCount: "desc" as const }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const [links, totalLinks, activeLinks, totalClicks] = await Promise.all([
    prisma.link.findMany({
      where,
      orderBy,
      select: {
        id: true,
        slug: true,
        originalUrl: true,
        title: true,
        eventName: true,
        channel: true,
        isActive: true,
        createdAt: true,
        expiresAt: true,
        clickCount: true,
        uniqueClickCount: true,
      },
    }),
    prisma.link.count(),
    prisma.link.count({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
    prisma.link.aggregate({
      _sum: {
        clickCount: true,
      },
    }),
  ]);

  return (
    <AppShell title="Dashboard" eyebrow="Overview" showLogout>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Total links</p>
          <p className="mt-3 text-2xl font-semibold text-zinc-950">
            {totalLinks}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Active links</p>
          <p className="mt-3 text-2xl font-semibold text-zinc-950">
            {activeLinks}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Total clicks</p>
          <p className="mt-3 text-2xl font-semibold text-zinc-950">
            {totalClicks._sum.clickCount ?? 0}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <form className="grid flex-1 gap-3 sm:grid-cols-[1fr_180px_auto]">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Search links
              </span>
              <input
                name="q"
                defaultValue={query}
                placeholder="Slug, event, or channel"
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Sort</span>
              <select
                name="sort"
                defaultValue={sortMode}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              >
                <option value="newest">Newest</option>
                <option value="most-clicked">Most clicked</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 sm:mt-7"
            >
              Apply
            </button>
          </form>
          <Link
            href="/dashboard/new"
            className="rounded-md border border-zinc-300 px-4 py-2 text-center text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
          >
            Create link
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {links.length > 0 ? (
            links.map((link) => {
              const status = getLinkStatus(link);

              return (
                <Link
                  key={link.id}
                  href={`/dashboard/${link.slug}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-all text-lg font-semibold text-zinc-950">
                          /{link.slug}
                        </h2>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      {link.title ? (
                        <p className="mt-2 text-sm font-medium text-zinc-800">
                          {link.title}
                        </p>
                      ) : null}
                      <p className="mt-2 break-all text-sm text-zinc-600">
                        {link.originalUrl}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                        {link.eventName ? (
                          <span className="rounded-md bg-zinc-100 px-2 py-1">
                            {link.eventName}
                          </span>
                        ) : null}
                        {link.channel ? (
                          <span className="rounded-md bg-zinc-100 px-2 py-1">
                            {link.channel}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[420px]">
                      <div>
                        <p className="text-xs font-medium uppercase text-zinc-500">
                          Created
                        </p>
                        <p className="mt-1 text-zinc-800">
                          {formatDate(link.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-zinc-500">
                          Expires
                        </p>
                        <p className="mt-1 text-zinc-800">
                          {formatDate(link.expiresAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-zinc-500">
                          Clicks
                        </p>
                        <p className="mt-1 font-semibold text-zinc-950">
                          {link.clickCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-zinc-500">
                          Unique
                        </p>
                        <p className="mt-1 font-semibold text-zinc-950">
                          {link.uniqueClickCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center">
              <h2 className="text-lg font-semibold text-zinc-950">
                No links found
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Try a different search, or create a new short link for the next
                club event.
              </p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
