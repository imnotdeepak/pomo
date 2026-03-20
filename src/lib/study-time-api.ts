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
  durationMinutes: number,
  _userId: string
): Promise<StudySession | null> {
  try {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationMinutes }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (error) {
    console.error("Error recording study session:", error);
    return null;
  }
}

// Get complete history data
export async function getHistoryData(_userId?: string): Promise<HistoryData> {
  try {
    const res = await fetch("/api/sessions");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (error) {
    console.error("Error fetching history data:", error);
    return { totalStudyTime: 0, todayStudyTime: 0, heatmapData: [] };
  }
}
