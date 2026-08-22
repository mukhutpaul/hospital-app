
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { auth } from "./auth";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

export async function requirePermission(
  permissionCode: string
) {
  const session = await requireAuth();

  const userId = Number(session.user.id);

  const allowed = await hasPermission(
    userId,
    permissionCode
  );

  if (!allowed) {
    redirect("/unauthorized");
  }

  return session;
}