import { NextRequest, NextResponse } from "next/server";
import { addMember, apiErrorMessage, apiErrorStatus, type CreateMemberInput } from "@/lib/api";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: CreateMemberInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const member = await addMember(id, body);
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to add member.") },
      { status: apiErrorStatus(err) },
    );
  }
}
