import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { CreateLinkForm } from "./create-link-form";

type NewLinkPageProps = {
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function NewLinkPage({ searchParams }: NewLinkPageProps) {
  const { created } = await searchParams;

  return (
    <AppShell title="Create a link" eyebrow="New short link" showLogout>
      {created ? (
        <section className="max-w-xl rounded-lg border border-teal-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-teal-700">Link created</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            /{created}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            The short link was saved and is ready to use.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Back to dashboard
            </Link>
            <Link
              href="/dashboard/new"
              className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
            >
              Create another
            </Link>
          </div>
        </section>
      ) : (
        <CreateLinkForm />
      )}
    </AppShell>
  );
}
