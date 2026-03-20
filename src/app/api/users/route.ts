import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST /api/users — upsert the authenticated user into the users table
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;

  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert(
      { clerk_user_id: userId, email, name },
      { onConflict: "clerk_user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
