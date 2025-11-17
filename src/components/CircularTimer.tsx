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
  const startTimeRef = useRef<number | null>(null);
  const totalDurationRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0); // Store elapsed time when paused

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
      // Set start time and total duration when timer starts or resumes
      if (startTimeRef.current === null) {
        const remainingSeconds = timer.minutes * 60 + timer.seconds;
        const totalSeconds = timer.isBreak
          ? timer.breakTime * 60
          : timer.focusTime * 60;
        
        // Check if this is a fresh start (remaining time equals total time) or a resume
        const isFreshStart = Math.abs(remainingSeconds - totalSeconds) < 1; // Allow 1 second tolerance
        
        if (isFreshStart) {
          // Fresh start - reset elapsed time
          elapsedTimeRef.current = 0;
          startTimeRef.current = Date.now();
          totalDurationRef.current = totalSeconds;
          console.log(`Fresh start - totalDuration: ${totalDurationRef.current.toFixed(2)}s`);
        } else {
          // Resume - use the stored elapsed time and set startTime to continue from there
          // Calculate what the startTime should be to continue from elapsedTimeRef
          const now = Date.now();
          // Set startTime to be in the past by the amount of elapsed time
          // This way, when we calculate elapsed = now - startTime, we get the correct value
          startTimeRef.current = now - elapsedTimeRef.current * 1000;
          totalDurationRef.current = remainingSeconds + elapsedTimeRef.current;
          
          // Immediately update progress to avoid any visual jump
          if (progressRef.current) {
            const progress = Math.min(elapsedTimeRef.current / totalDurationRef.current, 1);
            const strokeDashoffset = circumference - progress * circumference;
            progressRef.current.setAttribute("stroke-dashoffset", strokeDashoffset.toString());
          }
          
          console.log(`Resumed - elapsedTimeRef: ${elapsedTimeRef.current.toFixed(2)}s, remaining: ${remainingSeconds}s, totalDuration: ${totalDurationRef.current.toFixed(2)}s`);
        }
      }

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000; // elapsed seconds
          const remaining = Math.max(0, totalDurationRef.current - elapsed);

          if (remaining <= 0) {
            // Timer finished - immediately switch state
            const newIsBreak = !timer.isBreak;
            const completedDuration = timer.isBreak
              ? originalBreakTime.current
              : originalFocusTime.current;

            // Record focus session only once when timer finishes
            if (!timer.isBreak && !sessionRecordedRef.current) {
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

            // Reset refs and switch to new mode
            startTimeRef.current = null;
            totalDurationRef.current = 0;
            elapsedTimeRef.current = 0;

            setTimer({
              minutes: newIsBreak
                ? originalBreakTime.current
                : originalFocusTime.current,
              seconds: 0,
              isRunning: false,
              isBreak: newIsBreak,
              focusTime: timer.focusTime,
              breakTime: timer.breakTime,
            });
          } else {
            // Update display time
            const minutes = Math.floor(remaining / 60);
            const seconds = Math.floor(remaining % 60);

            setTimer((prev) => ({
              ...prev,
              minutes,
              seconds,
            }));
          }
        }
      }, 100); // Update every 100ms for smooth animation
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Store elapsed time when paused
      if (startTimeRef.current !== null) {
        const pausedAt = Date.now();
        elapsedTimeRef.current = (pausedAt - startTimeRef.current) / 1000;
        console.log(`Paused - stored elapsed time: ${elapsedTimeRef.current.toFixed(2)}s, paused at: ${pausedAt}`);
        startTimeRef.current = null;
      }
      // Note: If startTimeRef is already null, elapsedTimeRef should already be set from previous pause
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    timer.isRunning,
    timer.isBreak,
    timer.focusTime,
    timer.breakTime,
    onTimerFinish,
  ]);

  // Update circle progress smoothly based on elapsed time
  useEffect(() => {
    if (!progressRef.current) return;

    const totalSeconds = timer.isBreak
      ? timer.breakTime * 60
      : timer.focusTime * 60;

    // Use totalDurationRef if available (for resumed timers), otherwise use totalSeconds
    const totalDuration = totalDurationRef.current > 0 ? totalDurationRef.current : totalSeconds;

    let elapsed = 0;
    let progress = 0;

    if (timer.isRunning) {
      // Timer is running
      if (startTimeRef.current && totalDurationRef.current > 0) {
        // Calculate elapsed from start time (accounts for resume)
        elapsed = (Date.now() - startTimeRef.current) / 1000;
        progress = Math.min(elapsed / totalDurationRef.current, 1);
      } else if (elapsedTimeRef.current > 0) {
        // Fallback: use stored elapsed time if startTimeRef not set yet (during resume)
        // Use the same totalDuration to avoid jumps
        elapsed = elapsedTimeRef.current;
        progress = Math.min(elapsed / totalDuration, 1);
      } else {
        // Last resort: calculate from remaining time (only for fresh starts)
        const remainingSeconds = timer.minutes * 60 + timer.seconds;
        elapsed = totalSeconds - remainingSeconds;
        progress = Math.min(Math.max(elapsed, 0) / totalSeconds, 1);
      }
    } else {
      // Timer is paused - use stored elapsed time
      // Use the same totalDuration that was used when running to avoid jumps
      const pausedTotalDuration = totalDurationRef.current > 0 ? totalDurationRef.current : totalSeconds;
      
      if (elapsedTimeRef.current > 0) {
        elapsed = elapsedTimeRef.current;
        progress = Math.min(elapsed / pausedTotalDuration, 1);
      } else {
        // Fallback: calculate from remaining time
        const remainingSeconds = timer.minutes * 60 + timer.seconds;
        elapsed = totalSeconds - remainingSeconds;
        progress = Math.min(elapsed / totalSeconds, 1);
      }
    }

    const strokeDashoffset = circumference - progress * circumference;
    progressRef.current.setAttribute(
      "stroke-dashoffset",
      strokeDashoffset.toString()
    );

    // Check if timer state switched (focus to break or break to focus)
    if (prevIsBreakRef.current !== timer.isBreak) {
      prevIsBreakRef.current = timer.isBreak;
    }
  }, [
    timer.minutes,
    timer.seconds,
    timer.isBreak,
    timer.isRunning,
    timer.focusTime,
    timer.breakTime,
    circumference,
  ]);

  // Separate effect for smooth progress updates during timer running
  useEffect(() => {
    if (!timer.isRunning || !progressRef.current) return;

    // Immediately update progress when resuming to avoid jump to 0
    const updateProgress = () => {
      if (!progressRef.current) return;

      const totalSeconds = timer.isBreak
        ? timer.breakTime * 60
        : timer.focusTime * 60;

      // Use totalDurationRef if available (for resumed timers), otherwise use totalSeconds
      const totalDuration = totalDurationRef.current > 0 ? totalDurationRef.current : totalSeconds;

      let elapsed = 0;
      let progress = 0;

      if (startTimeRef.current && totalDurationRef.current > 0) {
        // Use startTimeRef calculation (most accurate)
        elapsed = (Date.now() - startTimeRef.current) / 1000;
        progress = Math.min(elapsed / totalDurationRef.current, 1);
      } else if (elapsedTimeRef.current > 0) {
        // Fallback: use stored elapsed time (for resume before startTimeRef is set)
        // Use the same totalDuration to avoid jumps
        elapsed = elapsedTimeRef.current;
        progress = Math.min(elapsed / totalDuration, 1);
      } else {
        // Last resort: calculate from remaining time
        const remainingSeconds = timer.minutes * 60 + timer.seconds;
        elapsed = totalSeconds - remainingSeconds;
        progress = Math.min(Math.max(elapsed, 0) / totalSeconds, 1);
      }

      const strokeDashoffset = circumference - progress * circumference;
      progressRef.current.setAttribute(
        "stroke-dashoffset",
        strokeDashoffset.toString()
      );
    };

    // Update immediately
    updateProgress();

    // Then update smoothly
    const progressInterval = setInterval(updateProgress, 50);

    return () => clearInterval(progressInterval);
  }, [timer.isRunning, circumference, timer.isBreak, timer.focusTime, timer.breakTime, timer.minutes, timer.seconds]);

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
    // elapsedTimeRef is preserved for resume, or 0 for fresh start
    setTimer((prev) => ({ ...prev, isRunning: true }));
  };

  const stopTimer = () => {
    // Don't reset startTimeRef here - let the useEffect handle it so elapsedTimeRef is stored
    setTimer((prev) => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    startTimeRef.current = null; // Reset start time
    elapsedTimeRef.current = 0; // Reset elapsed time
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
            className="transition-all duration-100 ease-out"
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
