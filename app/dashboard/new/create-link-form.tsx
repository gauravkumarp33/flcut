"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createLinkAction, type CreateLinkFormState } from "./actions";

const initialState: CreateLinkFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
    >
      {pending ? "Creating..." : "Create link"}
    </button>
  );
}

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

function Field({
  label,
  name,
  error,
  type = "text",
  placeholder,
  required = false,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
      />
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export function CreateLinkForm() {
  const [state, formAction] = useActionState(createLinkAction, initialState);

  return (
    <form
      action={formAction}
      className="max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-5">
        {state.message ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {state.message}
          </div>
        ) : null}

        <Field
          label="Destination URL"
          name="originalUrl"
          type="url"
          placeholder="https://example.com"
          required
          error={state.fieldErrors?.originalUrl}
        />

        <Field
          label="Short slug"
          name="slug"
          placeholder="club-event"
          error={state.fieldErrors?.slug}
        />

        <Field
          label="Title"
          name="title"
          placeholder="Freshers meetup"
          error={state.fieldErrors?.title}
        />

        <Field
          label="Event name"
          name="eventName"
          placeholder="June campus drive"
          error={state.fieldErrors?.eventName}
        />

        <Field
          label="Channel"
          name="channel"
          placeholder="instagram"
          error={state.fieldErrors?.channel}
        />

        <Field
          label="Expires at"
          name="expiresAt"
          type="datetime-local"
          error={state.fieldErrors?.expiresAt}
        />

        <SubmitButton />
      </div>
    </form>
  );
}
