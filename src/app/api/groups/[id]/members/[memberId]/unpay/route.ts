import { NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, markUnpaid } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const { id, memberId } = await params;
  try {
    const result = await markUnpaid(id, memberId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to undo contribution.") },
      { status: apiErrorStatus(err) },
    );
  }
}
