import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const authData = await auth();
  const { userId, sessionClaims, has } = authData;

  return NextResponse.json({
    userId,
    sessionClaims,
    hasPlan: has({ plan: "access" }),
  });
}
