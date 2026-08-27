import { notFound } from "next/navigation";
import { getGroupById } from "@/lib/api";
import GroupDetailClient from "@/components/GroupDetailClient";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await getGroupById(id);
  if (!group) notFound();

  return <GroupDetailClient group={group} />;
}
