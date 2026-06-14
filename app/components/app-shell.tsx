import Link from "next/link";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
};

const navigation = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/new", label: "New Link" },
];

export function AppShell({ children, title, eyebrow }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-xl font-semibold tracking-normal">
            FLCut
          </Link>
          <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-10">
          <div className="mb-8">
            {eyebrow ? (
              <p className="mb-2 text-sm font-medium uppercase tracking-wide text-teal-700">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">
              {title}
            </h1>
          </div>
          {children}
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-5 py-4 text-sm text-zinc-500">
          Built for internal FLCut club use.
        </div>
      </footer>
    </div>
  );
}
