import { AppShell } from "../../components/app-shell";

export default function NewLinkPage() {
  return (
    <AppShell title="Create a link" eyebrow="Placeholder">
      <section className="max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">
              Destination URL
            </span>
            <input
              type="url"
              placeholder="https://example.com"
              disabled
              className="mt-2 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-700">
              Short code
            </span>
            <input
              type="text"
              placeholder="club-event"
              disabled
              className="mt-2 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500"
            />
          </label>

          <button
            type="button"
            disabled
            className="rounded-md bg-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600"
          >
            Create link
          </button>
        </div>
      </section>
    </AppShell>
  );
}
