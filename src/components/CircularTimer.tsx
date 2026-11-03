"use client";

import { useState, useEffect, useRef } from "react";
import { recordStudySession } from "@/lib/study-time-api";

interface TimerState {
  isRunning: boolean;
  isBreak: boolean;
  focusTime: number; // in minutes
  breakTime: number; // in minutes
  remainingMs: number; // exact while paused; refreshed once per second while running
}

interface CircularTimerProps {
  onBreakChange?: (isBreak: boolean) => void;
  onRunningChange?: (isRunning: boolean) => void;
  onTimerFinish?: (wasBreak: boolean) => void;
  focusTime?: number;
  breakTime?: number;
  userId?: string;
}

const MAX_MINUTES = 999;
const TICK_MS = 100;
const RADIUS = 220;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const clampMinutes = (minutes: number) => Math.min(Math.max(minutes, 1), MAX_MINUTES);

const fullDurationMs = (state: Pick<TimerState, "isBreak" | "focusTime" | "breakTime">) =>
  (state.isBreak ? state.breakTime : state.focusTime) * 60_000;

// Updates the ring directly (bypassing React) so it can animate between re-renders
const drawProgress = (
  circle: SVGCircleElement | null,
  remainingMs: number,
  totalMs: number
) => {
  if (!circle) return;
  const progress = Math.min(Math.max(1 - remainingMs / totalMs, 0), 1);
  circle.setAttribute(
    "stroke-dashoffset",
    (CIRCUMFERENCE - progress * CIRCUMFERENCE).toString()
  );
};

export default function CircularTimer({
  onBreakChange,
  onRunningChange,
  onTimerFinish,
  focusTime = 25,
  breakTime = 5,
  userId,
}: CircularTimerProps) {
  const [timer, setTimer] = useState<TimerState>(() => ({
    isRunning: false,
    isBreak: false,
    focusTime: clampMinutes(focusTime),
    breakTime: clampMinutes(breakTime),
    remainingMs: clampMinutes(focusTime) * 60_000,
  }));

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("25");
  const progressRef = useRef<SVGCircleElement>(null);
  // Wall-clock time the current run ends; null while paused. Source of truth while running.
  const endsAtRef = useRef<number | null>(null);

  // Keep the latest callbacks/user in refs so parent re-renders don't restart the tick loop
  const onTimerFinishRef = useRef(onTimerFinish);
  const userIdRef = useRef(userId);
  useEffect(() => {
    onTimerFinishRef.current = onTimerFinish;
    userIdRef.current = userId;
  });

  // Apply new durations from settings; a running timer keeps its current countdown
  useEffect(() => {
    setTimer((prev) => {
      const next = {
        ...prev,
        focusTime: clampMinutes(focusTime),
        breakTime: clampMinutes(breakTime),
      };
      return endsAtRef.current === null
        ? { ...next, remainingMs: fullDurationMs(next) }
        : next;
    });
  }, [focusTime, breakTime]);

  // Draw the ring whenever the timer is idle/paused or its mode/duration changes
  useEffect(() => {
    if (!timer.isRunning) {
      drawProgress(progressRef.current, timer.remainingMs, fullDurationMs(timer));
    }
  }, [timer]);

  // Tick loop while running
  useEffect(() => {
    if (!timer.isRunning) return;

    const totalMs = fullDurationMs(timer);

    const tick = () => {
      if (endsAtRef.current === null) return;
      const remainingMs = Math.max(0, endsAtRef.current - Date.now());
      drawProgress(progressRef.current, remainingMs, totalMs);

      if (remainingMs > 0) {
        // Only re-render when the displayed second changes
        setTimer((prev) =>
          Math.ceil(prev.remainingMs / 1000) === Math.ceil(remainingMs / 1000)
            ? prev
            : { ...prev, remainingMs }
        );
        return;
      }

      // Finished — switch modes, record focus sessions, notify parent
      endsAtRef.current = null;
      clearInterval(interval);
      const wasBreak = timer.isBreak;
      if (!wasBreak && userIdRef.current) {
        recordStudySession(timer.focusTime);
      }
      setTimer((prev) => {
        const next = { ...prev, isRunning: false, isBreak: !wasBreak };
        return { ...next, remainingMs: fullDurationMs(next) };
      });
      onTimerFinishRef.current?.(wasBreak);
    };

    tick();
    const interval = setInterval(tick, TICK_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only on run/mode/duration changes, not every second
  }, [timer.isRunning, timer.isBreak, timer.focusTime, timer.breakTime]);

  // Notify parent component about break state changes
  useEffect(() => {
    onBreakChange?.(timer.isBreak);
  }, [timer.isBreak, onBreakChange]);

  // Notify parent component about running state changes
  useEffect(() => {
    onRunningChange?.(timer.isRunning);
  }, [timer.isRunning, onRunningChange]);

  const startTimer = () => {
    endsAtRef.current = Date.now() + timer.remainingMs;
    setTimer((prev) => ({ ...prev, isRunning: true }));
  };

  const stopTimer = () => {
    const remainingMs =
      endsAtRef.current === null
        ? timer.remainingMs
        : Math.max(0, endsAtRef.current - Date.now());
    endsAtRef.current = null;
    setTimer((prev) => ({ ...prev, isRunning: false, remainingMs }));
  };

  // Resets a focus session, or skips a break back to focus
  const resetTimer = () => {
    endsAtRef.current = null;
    setTimer((prev) => ({
      ...prev,
      isRunning: false,
      isBreak: false,
      remainingMs: prev.focusTime * 60_000,
    }));
  };

  const handleTimeClick = () => {
    if (!timer.isRunning) {
      setIsEditing(true);
      setEditValue(
        timer.isBreak ? timer.breakTime.toString() : timer.focusTime.toString()
      );
    }
  };

  const handleTimeEdit = (newTime: number) => {
    const minutes = clampMinutes(newTime);
    setTimer((prev) => ({
      ...prev,
      ...(prev.isBreak ? { breakTime: minutes } : { focusTime: minutes }),
      remainingMs: minutes * 60_000,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditValue(value);
    const newTime = parseInt(value);
    if (!isNaN(newTime) && newTime > 0 && newTime <= MAX_MINUTES) {
      handleTimeEdit(newTime);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const formatTime = (remainingMs: number) => {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const accent = timer.isBreak ? "#936dfc" : "#6db0fc";

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-6">
        {timer.isBreak ? "Break Time" : "Focus Time"}
      </h2>

      <div className="relative w-[36rem] h-[36rem] mx-auto mb-8">
        <svg
          className="w-[36rem] h-[36rem] transform -rotate-90"
          viewBox="0 0 576 576"
        >
          {/* Background circle */}
          <circle
            cx="288"
            cy="288"
            r={RADIUS}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            ref={progressRef}
            cx="288"
            cy="288"
            r={RADIUS}
            stroke={accent}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            className="transition-[stroke-dashoffset] duration-100 ease-linear"
          />
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="number"
                value={editValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="text-4xl font-mono font-bold text-white bg-transparent border-none text-center w-20 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
                max={MAX_MINUTES}
                autoFocus
              />
              <div className="text-sm text-white/60">minutes</div>
            </div>
          ) : (
            <div
              className="cursor-pointer"
              onClick={handleTimeClick}
              title="Click to edit time"
            >
              <div className="text-4xl font-mono font-bold text-white mb-2">
                {formatTime(timer.remainingMs)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-x-4">
        {!timer.isRunning ? (
          <button
            onClick={startTimer}
            className={`${
              timer.isBreak
                ? "bg-[#fcb96d]/20 hover:bg-[#fcb96d]/40 border-2 border-[#fcb96d]/60 hover:border-[#fcb96d]/80"
                : "bg-[#6db0fc]/20 hover:bg-[#6db0fc]/40 border-2 border-[#6db0fc]/60 hover:border-[#6db0fc]/80"
            } hover:scale-105 backdrop-blur-md text-white font-medium py-3 px-8 rounded-lg transition-all duration-1000`}
          >
            Start
          </button>
        ) : (
          <button
            onClick={stopTimer}
            className={`${
              timer.isBreak
                ? "bg-[#fcb96d]/20 hover:bg-[#fcb96d]/40 border-2 border-[#fcb96d]/60 hover:border-[#fcb96d]/80"
                : "bg-[#6db0fc]/20 hover:bg-[#6db0fc]/40 border-2 border-[#6db0fc]/60 hover:border-[#6db0fc]/80"
            } hover:scale-105 backdrop-blur-md text-white font-medium py-3 px-8 rounded-lg transition-all duration-1000`}
          >
            Stop
          </button>
        )}

        <button
          onClick={resetTimer}
          className={`${
            timer.isBreak
              ? "bg-[#936dfc]/20 hover:bg-[#936dfc]/40 border-2 border-[#936dfc]/60 hover:border-[#936dfc]/80"
              : "bg-[#8ace00]/20 hover:bg-[#8ace00]/40 border-2 border-[#8ace00]/60 hover:border-[#8ace00]/80"
          } hover:scale-105 backdrop-blur-md text-white font-medium py-3 px-8 rounded-lg transition-all duration-1000`}
        >
          {timer.isBreak ? "Skip" : "Reset"}
        </button>
      </div>
    </div>
  );
}
