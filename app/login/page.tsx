import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-12 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-xl font-semibold tracking-normal">
          FLCut
        </Link>
        <div className="mb-6 mt-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-teal-700">
            Admin
          </p>
          <h1 className="text-3xl font-semibold tracking-normal">
            Dashboard login
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Enter the shared club admin password to manage FLCut links.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
