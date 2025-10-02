"use client";

import { useState, useEffect, useRef } from "react";

interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isBreak: boolean;
}

export default function PomodoroTimer() {
  const [timer, setTimer] = useState<TimerState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isBreak: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            // Timer finished
            const newIsBreak = !prev.isBreak;
            return {
              minutes: newIsBreak ? 5 : 25,
              seconds: 0,
              isRunning: false,
              isBreak: newIsBreak,
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
  }, [timer.isRunning]);

  const startTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: true }));
  };

  const stopTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setTimer({
      minutes: timer.isBreak ? 5 : 25,
      seconds: 0,
      isRunning: false,
      isBreak: false,
    });
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
      <h2 className="text-2xl font-bold text-white mb-6">
        {timer.isBreak ? "Break Time" : "Focus Time"}
      </h2>

      <div className="mb-8">
        <div className="text-6xl font-mono font-bold text-white mb-4">
          {formatTime(timer.minutes, timer.seconds)}
        </div>

        <div className="w-full bg-white/20 rounded-full h-2 mb-6">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{
              width: `${
                (((timer.isBreak ? 5 : 25) * 60 -
                  (timer.minutes * 60 + timer.seconds)) /
                  ((timer.isBreak ? 5 : 25) * 60)) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      <div className="space-x-4">
        {!timer.isRunning ? (
          <button
            onClick={startTimer}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Start
          </button>
        ) : (
          <button
            onClick={stopTimer}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Stop
          </button>
        )}

        <button
          onClick={resetTimer}
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
