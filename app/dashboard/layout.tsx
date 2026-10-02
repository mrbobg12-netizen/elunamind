import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "../../lib/auth";
import { getUsageToday } from "../../lib/usage";
import { buildUsageSummary } from "../../lib/plans";
import { UsageProvider } from "../_components/UsageProvider";
import { Shell } from "./Shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard — Eluna Mind", robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireUser();
  if (!auth) redirect("/login?next=/dashboard");
  const counts = await getUsageToday(auth.user.id);
  return (
    <UsageProvider initial={{ plan: auth.plan, email: auth.user.email ?? "", usage: buildUsageSummary(auth.plan, counts) }}>
      <Shell>{children}</Shell>
    </UsageProvider>
  );
}
