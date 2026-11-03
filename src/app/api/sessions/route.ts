import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const HEATMAP_DAYS = 365;
const PAGE_SIZE = 1000;

// Formats a timestamp as YYYY-MM-DD in the given IANA timezone
function makeLocalDateFormatter(timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    // Invalid timezone — fall back to UTC
    return makeLocalDateFormatter("UTC");
  }
}

// GET /api/sessions?tz=<IANA timezone> — fetch history data for the authenticated user,
// bucketed by day in the user's own timezone
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const toLocalDate = makeLocalDateFormatter(
    req.nextUrl.searchParams.get("tz") || "UTC"
  );

  // Fetch one extra day so the oldest local day is fully covered in any timezone
  const since = new Date(Date.now() - (HEATMAP_DAYS + 1) * 24 * 60 * 60 * 1000);

  const statsResult = await supabaseAdmin
    .from("user_stats")
    .select("total_study_time_minutes")
    .eq("user_id", userId)
    .maybeSingle();

  const minutesByDate = new Map<string, number>();
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabaseAdmin
      .from("study_sessions")
      .select("created_at, duration_minutes")
      .eq("user_id", userId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Error loading sessions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const session of data) {
      const date = toLocalDate.format(new Date(session.created_at));
      minutesByDate.set(date, (minutesByDate.get(date) ?? 0) + session.duration_minutes);
    }
    if (data.length < PAGE_SIZE) break;
  }

  // Walk back from the user's local "today" using UTC date math (no DST surprises)
  const todayStr = toLocalDate.format(new Date());
  const [year, month, day] = todayStr.split("-").map(Number);
  const heatmapData: { date: string; minutes: number }[] = [];
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const date = new Date(Date.UTC(year, month - 1, day - i))
      .toISOString()
      .split("T")[0];
    heatmapData.push({ date, minutes: minutesByDate.get(date) ?? 0 });
  }

  const totalStudyTime = statsResult.data?.total_study_time_minutes ?? 0;
  const todayStudyTime = minutesByDate.get(todayStr) ?? 0;

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
