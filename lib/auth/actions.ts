"use server";

import { redirect } from "next/navigation";

export async function logoutAction() {
  const { clearAuthSession } = await import("@/lib/auth/session-cookie");

  await clearAuthSession();
  redirect("/login");
}
