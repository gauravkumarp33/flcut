import { AppShell } from "../components/app-shell";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" eyebrow="Overview">
      <section className="grid gap-4 sm:grid-cols-3">
        {["Active links", "Total clicks", "Pending setup"].map((label) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">--</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-950">
          Link table placeholder
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          This area will show created links once storage and tracking are added.
        </p>
      </section>
    </AppShell>
  );
}
