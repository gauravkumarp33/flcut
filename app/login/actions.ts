"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminSessionCookieName,
  createAdminSessionValue,
  getAdminPassword,
  getAdminSessionCookieOptions,
} from "../lib/auth";

export type LoginFormState = {
  message?: string;
};

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const adminPassword = getAdminPassword();
  const submittedPassword = formData.get("password");

  if (!adminPassword) {
    return {
      message: "Admin login is not configured.",
    };
  }

  if (typeof submittedPassword !== "string" || submittedPassword !== adminPassword) {
    return {
      message: "Invalid admin password.",
    };
  }

  const sessionValue = await createAdminSessionValue();

  if (!sessionValue) {
    return {
      message: "Admin login is not configured.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    adminSessionCookieName,
    sessionValue,
    getAdminSessionCookieOptions(),
  );

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookieName);

  redirect("/login");
}
