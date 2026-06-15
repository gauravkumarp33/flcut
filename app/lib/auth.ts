export const adminSessionCookieName = "flcut_admin";

const sessionMaxAgeSeconds = 60 * 60 * 8;
const textEncoder = new TextEncoder();

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD;
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

export async function createAdminSessionValue() {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return null;
  }

  return sha256Hex(`flcut-admin-session:${adminPassword}`);
}

export async function isValidAdminSession(value: string | undefined) {
  if (!value) {
    return false;
  }

  const expectedValue = await createAdminSessionValue();

  return Boolean(expectedValue && constantTimeEqual(value, expectedValue));
}
