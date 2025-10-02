"use client";

import { useState, useEffect, useRef } from "react";
import { recordStudySession } from "@/lib/study-time-api";

interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isBreak: boolean;
  focusTime: number; // in minutes
  breakTime: number; // in minutes
}

interface CircularTimerProps {
  onBreakChange?: (isBreak: boolean) => void;
  onRunningChange?: (isRunning: boolean) => void;
  onTimerFinish?: () => void;
  focusTime?: number;
  breakTime?: number;
}

export default function CircularTimer({
  onBreakChange,
  onRunningChange,
  onTimerFinish,
  focusTime = 25,
  breakTime = 5,
}: CircularTimerProps) {
  const [timer, setTimer] = useState<TimerState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isBreak: false,
    focusTime: 25,
    breakTime: 5,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("25");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const prevIsBreakRef = useRef(timer.isBreak);
  const sessionRecordedRef = useRef(false);

  // Store original times to preserve them when switching modes
  const originalFocusTime = useRef(focusTime);
  const originalBreakTime = useRef(breakTime);

  // Update original times when props change
  useEffect(() => {
    const limitedFocusTime = Math.min(focusTime, 999);
    const limitedBreakTime = Math.min(breakTime, 999);

    originalFocusTime.current = limitedFocusTime;
    originalBreakTime.current = limitedBreakTime;

    // Only update timer state if not running to avoid interfering with active timer
    setTimer((prev) => ({
      ...prev,
      focusTime: limitedFocusTime,
      breakTime: limitedBreakTime,
      // Only update minutes/seconds if timer is not running
      ...(prev.isRunning
        ? {}
        : {
            minutes: prev.isBreak ? limitedBreakTime : limitedFocusTime,
            seconds: 0,
          }),
    }));
  }, [focusTime, breakTime]);

  const radius = 220;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            // Timer finished - immediately switch state
            const newIsBreak = !prev.isBreak;
            const completedDuration = prev.isBreak
              ? originalBreakTime.current
              : originalFocusTime.current;

            // Record focus session only once when timer finishes
            if (!prev.isBreak && !sessionRecordedRef.current) {
              console.log(
                "Timer finished - recording focus session:",
                completedDuration,
                "minutes"
              );
              sessionRecordedRef.current = true;
              recordStudySession(completedDuration);
            }

            // Notify parent component that timer finished
            setTimeout(() => {
              onTimerFinish?.();
            }, 100);

            return {
              minutes: newIsBreak
                ? originalBreakTime.current
                : originalFocusTime.current,
              seconds: 0,
              isRunning: false,
              isBreak: newIsBreak,
              focusTime: prev.focusTime,
              breakTime: prev.breakTime,
            };
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, onTimerFinish]);

  // Update circle progress based on timer state (discrete updates)
  useEffect(() => {
    if (progressRef.current) {
      const totalSeconds = timer.isBreak
        ? timer.breakTime * 60
        : timer.focusTime * 60;

      const remainingSeconds = timer.minutes * 60 + timer.seconds;

      const progress = (totalSeconds - remainingSeconds) / totalSeconds;
      const strokeDashoffset = circumference - progress * circumference;

      progressRef.current.setAttribute(
        "stroke-dashoffset",
        strokeDashoffset.toString()
      );

      // Check if timer state switched (focus to break or break to focus)
      if (prevIsBreakRef.current !== timer.isBreak) {
        prevIsBreakRef.current = timer.isBreak;
      }
    }
  }, [
    timer.minutes,
    timer.seconds,
    timer.isBreak,
    timer.focusTime,
    timer.breakTime,
    circumference,
  ]);

  // Notify parent component about break state changes
  useEffect(() => {
    onBreakChange?.(timer.isBreak);
  }, [timer.isBreak, onBreakChange]);

  // Notify parent component about running state changes
  useEffect(() => {
    onRunningChange?.(timer.isRunning);
  }, [timer.isRunning, onRunningChange]);

  const startTimer = () => {
    sessionRecordedRef.current = false; // Reset flag for new session
    setTimer((prev) => ({ ...prev, isRunning: true }));
  };

  const stopTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    if (timer.isBreak) {
      // Skip break - switch to focus mode
      setTimer({
        minutes: originalFocusTime.current,
        seconds: 0,
        isRunning: false,
        isBreak: false,
        focusTime: timer.focusTime,
        breakTime: timer.breakTime,
      });
    } else {
      // Reset focus timer
      setTimer({
        minutes: originalFocusTime.current,
        seconds: 0,
        isRunning: false,
        isBreak: false,
        focusTime: timer.focusTime,
        breakTime: timer.breakTime,
      });
    }
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
    const limitedTime = Math.min(newTime, 999); // Limit to 3 digits
    if (limitedTime > 0) {
      if (timer.isBreak) {
        originalBreakTime.current = limitedTime;
        setTimer((prev) => ({
          ...prev,
          breakTime: limitedTime,
          minutes: limitedTime,
          seconds: 0,
        }));
      } else {
        originalFocusTime.current = limitedTime;
        setTimer((prev) => ({
          ...prev,
          focusTime: limitedTime,
          minutes: limitedTime,
          seconds: 0,
        }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditValue(value);
    const newTime = parseInt(value);
    if (!isNaN(newTime) && newTime > 0 && newTime <= 999) {
      handleTimeEdit(newTime);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const formatTime = (minutes: number, seconds: number) => {
    const safeMinutes = Math.min(minutes ?? 0, 999); // Limit to 3 digits
    const safeSeconds = seconds ?? 0;
    return `${safeMinutes.toString().padStart(2, "0")}:${safeSeconds
      .toString()
      .padStart(2, "0")}`;
  };

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
            ref={circleRef}
            cx="288"
            cy="288"
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            ref={progressRef}
            cx="288"
            cy="288"
            r={radius}
            stroke={timer.isBreak ? "#936dfc" : "#6db0fc"}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            className="transition-all duration-1000"
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
                max="60"
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
                {formatTime(timer.minutes, timer.seconds)}
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
