import { NextRequest, NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, recordPayout, type RecordPayoutInput } from "@/lib/api";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: RecordPayoutInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const payout = await recordPayout(id, body);
    return NextResponse.json(payout, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to record payout.") },
      { status: apiErrorStatus(err) },
    );
  }
}
