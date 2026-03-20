"use client";

import React, { useState, Suspense, lazy } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect } from "react"

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);
import CircularTimer from "@/components/CircularTimer";
import KanbanBoard from "@/components/KanbanBoard";
import SoundControlBar from "@/components/SoundControlBar";
import HistoryPopup from "@/components/HistoryPopup";

export default function Dashboard() {
  const { userId, isLoaded } = useAuth();
  const [showKanban, setShowKanban] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [focusTime, setFocusTime] = useState<number | string>(25);
  const [breakTime, setBreakTime] = useState<number | string>(5);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    if (isLoaded && userId) {
      fetch("/api/users", { method: "POST" }).catch(console.error);
    }
  }, [isLoaded, userId]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const handleSaveSettings = () => {
    setShowSettings(false);
    // The CircularTimer will receive the new values via props
  };

  const handleTimerFinish = () => {
    setTimerFinished(true);
    // Reset the flag after a short delay to allow for multiple timer finishes
    setTimeout(() => setTimerFinished(false), 100);
  };



  return (
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Dithering shader — always visible, cycles blue → green → blue */}
      <div className="absolute inset-0 pointer-events-none">
        <Suspense fallback={null}>
          <div className={`${isBreak ? "focus-shader-break" : "focus-shader"} absolute inset-0 opacity-60 mix-blend-screen`}>
            <Dithering
              colorBack="#00000000"
              colorFront="#6db0fc"
              shape="warp"
              type="4x4"
              speed={0.3}
              className="size-full"
              minPixelRatio={1}
            />
          </div>
        </Suspense>
      </div>


      {/* Kanban board button - bottom left */}
      <button
        onClick={() => setShowKanban(!showKanban)}
        className="fixed bottom-6 left-6 z-20 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/30 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110"
        title={showKanban ? "Hide Kanban Board" : "Show Kanban Board"}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* History button - bottom right */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="fixed bottom-6 right-6 z-20 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/30 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110"
        title="Study History"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <h1 className="text-3xl font-serif font-bold text-white">Pomo</h1>

          <div className="flex items-center space-x-3">
            {/* Clock Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="transition-transform duration-200 hover:scale-105"
              title="Timer Settings"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/30">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </button>

            {/* Profile - Clerk UserButton */}
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred background overlay */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />

            {/* Settings modal */}
            <div className="relative z-10 w-full max-w-md bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-white">
                  Timer Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/60 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Focus Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    maxLength={3}
                    value={focusTime}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setFocusTime("");
                      } else {
                        const numValue = parseInt(value);
                        setFocusTime(numValue < 1 ? 1 : numValue);
                      }
                    }}
                    className="w-full px-4 py-2 bg-black/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Break Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    maxLength={3}
                    value={breakTime}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setBreakTime("");
                      } else {
                        const numValue = parseInt(value);
                        setBreakTime(numValue < 1 ? 1 : numValue);
                      }
                    }}
                    className="w-full px-4 py-2 bg-black/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-8">
            <CircularTimer
              onBreakChange={setIsBreak}
              onRunningChange={setIsTimerRunning}
              onTimerFinish={handleTimerFinish}
              focusTime={typeof focusTime === "number" ? focusTime : 25}
              breakTime={typeof breakTime === "number" ? breakTime : 5}
              userId={userId ?? undefined}
            />
          </div>

          {/* Sound Control Bar */}
          <div className="w-full max-w-4xl px-4">
            <SoundControlBar
              isRunning={isTimerRunning}
              isBreak={isBreak}
              onTimerFinish={timerFinished ? handleTimerFinish : undefined}
            />
          </div>

          {showKanban && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Blurred background overlay */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowKanban(false)}
              />

              {/* Kanban board modal */}
              <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-serif font-bold text-white">
                    Kanban Board
                  </h2>
                  <button
                    onClick={() => setShowKanban(false)}
                    className="text-white/60 hover:text-white text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <KanbanBoard userId={userId ?? undefined} />
              </div>
            </div>
          )}

          {/* History Popup */}
          <HistoryPopup
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            userId={userId ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
