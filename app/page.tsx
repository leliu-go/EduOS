import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getRoleLandingPath } from "@/lib/auth/landing-path";

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  redirect(getRoleLandingPath(currentUser.roleKey));
}
