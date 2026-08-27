import { NextRequest, NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, createGroup, type CreateGroupInput } from "@/lib/api";

export async function POST(req: NextRequest) {
  let body: CreateGroupInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const group = await createGroup(body);
    return NextResponse.json(group, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to create group.") },
      { status: apiErrorStatus(err) },
    );
  }
}
