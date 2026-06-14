import Link from "next/link";
import { AppShell } from "./components/app-shell";
import { loopTraceMarkerVisible } from "./lib/markers";

export default function Home() {
  return (
    <AppShell title="Short links for club workflows" eyebrow="Internal beta">
      <section className="max-w-2xl">
        <p className="text-lg leading-8 text-zinc-600">
          FLCut will help the club create and track clean short links. This
          first version keeps the surface intentionally small while the core
          product shape settles.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Open dashboard
          </Link>
          <Link
            href="/dashboard/new"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-white"
          >
            Create placeholder
          </Link>
        </div>
        <p className="mt-8 text-xs text-zinc-400">{loopTraceMarkerVisible}</p>
      </section>
    </AppShell>
  );
}
