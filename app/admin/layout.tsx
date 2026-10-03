import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireAdmin } from "../../lib/auth";
import { AdminShell } from "./AdminShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Eluna Mind", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  // Not an admin? Behave as if the section does not exist.
  if (!admin) redirect("/dashboard");

  return <AdminShell email={admin.user.email ?? ""}>{children}</AdminShell>;
}
