import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/sessions — fetch history data for the authenticated user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  const startDate = oneYearAgo.toISOString().split("T")[0];

  const today = new Date();
  const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  const [statsResult, dailyResult, heatmapResult] = await Promise.all([
    supabaseAdmin
      .from("user_stats")
      .select("total_study_time_minutes")
      .eq("user_id", userId)
      .single(),
    supabaseAdmin
      .from("daily_stats")
      .select("focus_minutes")
      .eq("user_id", userId)
      .eq("date", todayStr)
      .single(),
    supabaseAdmin
      .from("daily_stats")
      .select("date, focus_minutes")
      .eq("user_id", userId)
      .gte("date", startDate)
      .order("date", { ascending: true }),
  ]);

  const totalStudyTime = statsResult.data?.total_study_time_minutes ?? 0;
  const todayStudyTime = dailyResult.data?.focus_minutes ?? 0;

  const dataMap = new Map(
    (heatmapResult.data ?? []).map((d) => [d.date, d.focus_minutes])
  );
  const heatmapData: { date: string; minutes: number }[] = [];
  for (let i = 0; i < 365; i++) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - (364 - i)
    );
    const dateStr = date.toISOString().split("T")[0];
    heatmapData.push({ date: dateStr, minutes: dataMap.get(dateStr) ?? 0 });
  }

  return NextResponse.json({ totalStudyTime, todayStudyTime, heatmapData });
}

// POST /api/sessions — record a completed focus session
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { durationMinutes } = await req.json();
  if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
    return NextResponse.json({ error: "Invalid durationMinutes" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("study_sessions")
    .insert({ user_id: userId, duration_minutes: durationMinutes })
    .select()
    .single();

  if (error) {
    console.error("Error recording session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
