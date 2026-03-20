"use client";

import { useState, useEffect } from "react";
import { getHistoryData, HistoryData } from "@/lib/study-time-api";

interface HistoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export default function HistoryPopup({ isOpen, onClose, userId }: HistoryPopupProps) {
  const [historyData, setHistoryData] = useState<HistoryData>({
    totalStudyTime: 0,
    todayStudyTime: 0,
    heatmapData: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchHistoryData();
    }
  }, [isOpen]);

  // Refresh data periodically when popup is open
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        fetchHistoryData();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchHistoryData = async () => {
    if (!userId) return;
    try {
      const data = await getHistoryData(userId);
      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching history data:", error);
      // Fallback to empty data on error
      setHistoryData({
        totalStudyTime: 0,
        todayStudyTime: 0,
        heatmapData: [],
      });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getHeatmapColor = (minutes: number) => {
    if (minutes === 0) return "bg-white/10";
    if (minutes <= 15) return "bg-[#6db0fc]/20";
    if (minutes <= 30) return "bg-[#6db0fc]/40";
    if (minutes <= 60) return "bg-[#6db0fc]/60";
    if (minutes <= 90) return "bg-[#6db0fc]/80";
    return "bg-[#6db0fc]";
  };

  const getHeatmapTooltip = (date: string, minutes: number) => {
    // Parse the date string as local date to avoid timezone issues
    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day); // month is 0-indexed

    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        dateObj.getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    });
    return `${formattedDate}: ${formatTime(minutes)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* History modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black/80 backdrop-blur-md rounded-2xl p-6 border border-white/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Study History</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchHistoryData}
              className="text-white/60 hover:text-white transition-colors p-1"
              title="Refresh data"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Study Time */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-[#6db0fc]/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#6db0fc]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Total Study Time
              </h3>
            </div>
            <p className="text-3xl font-bold text-[#6db0fc]">
              {formatTime(historyData.totalStudyTime)}
            </p>
            <p className="text-white/60 text-sm mt-1">
              All time focus sessions
            </p>
          </div>

          {/* Today's Study Time */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-[#8ace00]/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#8ace00]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Today&apos;s Progress
              </h3>
            </div>
            <p className="text-3xl font-bold text-[#8ace00]">
              {formatTime(historyData.todayStudyTime)}
            </p>
            <p className="text-white/60 text-sm mt-1">Focus time today</p>
          </div>
        </div>

        {/* 60-Day Heatmap */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            60-Day Activity Heatmap
          </h3>
          <div className="flex flex-wrap gap-1 mb-4 overflow-x-auto">
            {historyData.heatmapData.map((day, index) => (
              <div
                key={day.date}
                className={`w-3 h-3 aspect-square rounded-sm ${getHeatmapColor(
                  day.minutes
                )} border border-white/10 hover:border-white/30 transition-colors cursor-pointer`}
                title={getHeatmapTooltip(day.date, day.minutes)}
                style={{
                  animationDelay: `${index * 5}ms`,
                  animation: "fadeIn 0.3s ease-out forwards",
                  opacity: 0,
                }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-white/60 text-sm">
            <span>Less</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-white/10 rounded-sm"></div>
              <div className="w-3 h-3 bg-[#6db0fc]/20 rounded-sm"></div>
              <div className="w-3 h-3 bg-[#6db0fc]/40 rounded-sm"></div>
              <div className="w-3 h-3 bg-[#6db0fc]/60 rounded-sm"></div>
              <div className="w-3 h-3 bg-[#6db0fc]/80 rounded-sm"></div>
              <div className="w-3 h-3 bg-[#6db0fc] rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
