import { supabase } from "./supabase";

export interface StudySession {
  id: string;
  user_id: string;
  duration_minutes: number;
  completed_at: string;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_study_time_minutes: number;
  updated_at: string;
  created_at: string;
}

export interface DailyStats {
  id: string;
  user_id: string;
  date: string;
  focus_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface HistoryData {
  totalStudyTime: number;
  todayStudyTime: number;
  heatmapData: { date: string; minutes: number }[];
}

// Record a completed focus session
export async function recordStudySession(
  durationMinutes: number
): Promise<StudySession | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    console.log(
      "Recording study session:",
      durationMinutes,
      "minutes for user:",
      user.id
    );

    const { data, error } = await supabase
      .from("study_sessions")
      .insert({
        user_id: user.id,
        duration_minutes: durationMinutes,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Successfully recorded session:", data);
    return data;
  } catch (error) {
    console.error("Error recording study session:", error);
    return null;
  }
}

// Get user's total study time
export async function getTotalStudyTime(): Promise<number> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from("user_stats")
      .select("total_study_time_minutes")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data?.total_study_time_minutes || 0;
  } catch (error) {
    console.error("Error fetching total study time:", error);
    return 0;
  }
}

// Get today's study time
export async function getTodayStudyTime(): Promise<number> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    // Use local date instead of UTC to avoid timezone issues
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      .toISOString()
      .split("T")[0];

    const { data, error } = await supabase
      .from("daily_stats")
      .select("focus_minutes")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "not found"
    return data?.focus_minutes || 0;
  } catch (error) {
    console.error("Error fetching today study time:", error);
    return 0;
  }
}

// Get 365-day heatmap data
export async function getHeatmapData(): Promise<
  { date: string; minutes: number }[]
> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const startDate = oneYearAgo.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_stats")
      .select("date, focus_minutes")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .order("date", { ascending: true });

    if (error) throw error;

    // Fill in missing dates with 0 minutes
    const heatmapData: { date: string; minutes: number }[] = [];
    const dataMap = new Map(data?.map((d) => [d.date, d.focus_minutes]) || []);

    for (let i = 0; i < 365; i++) {
      // Use local date instead of UTC to avoid timezone issues
      const today = new Date();
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - (364 - i)
      );
      const dateStr = date.toISOString().split("T")[0];

      heatmapData.push({
        date: dateStr,
        minutes: dataMap.get(dateStr) || 0,
      });
    }

    return heatmapData;
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    return [];
  }
}

// Get complete history data
export async function getHistoryData(): Promise<HistoryData> {
  try {
    const [totalStudyTime, todayStudyTime, heatmapData] = await Promise.all([
      getTotalStudyTime(),
      getTodayStudyTime(),
      getHeatmapData(),
    ]);

    return {
      totalStudyTime,
      todayStudyTime,
      heatmapData,
    };
  } catch (error) {
    console.error("Error fetching history data:", error);
    return {
      totalStudyTime: 0,
      todayStudyTime: 0,
      heatmapData: [],
    };
  }
}

// Get user stats
export async function getUserStats(): Promise<UserStats | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}
