import { NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, markPaid } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const { id, memberId } = await params;
  try {
    const result = await markPaid(id, memberId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to record contribution.") },
      { status: apiErrorStatus(err) },
    );
  }
}
