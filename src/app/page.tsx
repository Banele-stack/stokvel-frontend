import { getGroups } from "@/lib/api";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const groups = await getGroups();
  return <DashboardClient groups={groups} />;
}
