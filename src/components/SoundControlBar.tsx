"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface SoundControlBarProps {
  isRunning: boolean;
  isBreak: boolean;
  onTimerFinish?: () => void;
}

interface SoundFiles {
  study: string[];
  alarms: string[];
}

const soundFiles: SoundFiles = {
  study: ["none", "brown.mp3", "rain.mp3"],
  alarms: ["none", "nature.mp3", "waterfall.mp3"],
};

export default function SoundControlBar({
  isRunning,
  isBreak,
  onTimerFinish,
}: SoundControlBarProps) {
  const [selectedStudySound, setSelectedStudySound] = useState<string>("none");
  const [selectedAlarmSound, setSelectedAlarmSound] = useState<string>("none");
  const [studyVolume, setStudyVolume] = useState<number>(50);
  const [showAlarmPopup, setShowAlarmPopup] = useState<boolean>(false);
  const [completedSessionType, setCompletedSessionType] =
    useState<boolean>(false); // false = focus, true = break

  const studyAudioRef = useRef<HTMLAudioElement | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle study sound looping - only during focus time (not break time)
  useEffect(() => {
    const audioElement = studyAudioRef.current;

    if (isRunning && !isBreak && selectedStudySound !== "none") {
      if (audioElement) {
        audioElement.loop = true;
        audioElement.volume = studyVolume / 100;
        audioElement.play().catch((error) => {
          console.error("Failed to play study sound:", error);
          console.log("Audio src:", audioElement.src);
        });
      }
    } else {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    }

    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [isRunning, isBreak, selectedStudySound, studyVolume]);

  const playAlarmSound = useCallback(() => {
    if (selectedAlarmSound !== "none" && alarmAudioRef.current) {
      alarmAudioRef.current.volume = 0.7;
      alarmAudioRef.current.play().catch((error) => {
        console.error("Failed to play alarm sound:", error);
        console.log("Alarm audio src:", alarmAudioRef.current?.src);
      });
      setShowAlarmPopup(true);
    }
  }, [selectedAlarmSound]);

  // Handle alarm sound when timer finishes
  useEffect(() => {
    if (onTimerFinish) {
      // Show popup for the NEXT session type (opposite of current)
      setCompletedSessionType(!isBreak);
      // This will be called when timer finishes
      if (selectedAlarmSound !== "none") {
        playAlarmSound();
      }
    }
  }, [onTimerFinish, selectedAlarmSound, isBreak, playAlarmSound]);

  const stopAlarm = () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
    setShowAlarmPopup(false);
  };

  const handleStudySoundChange = (sound: string) => {
    setSelectedStudySound(sound);

    // Stop current study sound
    if (studyAudioRef.current) {
      studyAudioRef.current.pause();
      studyAudioRef.current.currentTime = 0;
    }
  };

  const handleAlarmSoundChange = (sound: string) => {
    setSelectedAlarmSound(sound);

    // Stop current alarm sound
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }

    // Hide popup if alarm sound is changed to none
    if (sound === "none") {
      setShowAlarmPopup(false);
    }
  };

  const handleVolumeChange = (volume: number) => {
    setStudyVolume(volume);
  };

  // Separate effect for volume changes to avoid static sound
  useEffect(() => {
    if (studyAudioRef.current && selectedStudySound !== "none") {
      studyAudioRef.current.volume = studyVolume / 100;
    }
  }, [studyVolume, selectedStudySound]);

  return (
    <>
      {/* Sound Control Bar */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Study Sounds Dropdown */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Study Sounds
            </label>
            <select
              value={selectedStudySound}
              onChange={(e) => handleStudySoundChange(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {soundFiles.study.map((sound) => (
                <option key={sound} value={sound} className="bg-black">
                  {sound === "none"
                    ? "None"
                    : sound
                        .replace(/\.(mp3|MP3)$/, "")
                        .charAt(0)
                        .toUpperCase() +
                      sound.replace(/\.(mp3|MP3)$/, "").slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Volume Control for Study Sounds */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Volume ({studyVolume}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={studyVolume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <style jsx>{`
              .slider::-webkit-slider-thumb {
                appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #6db0fc;
                cursor: pointer;
              }
              .slider::-moz-range-thumb {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #6db0fc;
                cursor: pointer;
                border: none;
              }
            `}</style>
          </div>

          {/* Alarm Sounds Dropdown */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Alarm Sounds
            </label>
            <select
              value={selectedAlarmSound}
              onChange={(e) => handleAlarmSoundChange(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {soundFiles.alarms.map((sound) => (
                <option key={sound} value={sound} className="bg-black">
                  {sound === "none"
                    ? "None"
                    : sound
                        .replace(/\.(mp3|MP3)$/, "")
                        .charAt(0)
                        .toUpperCase() +
                      sound.replace(/\.(mp3|MP3)$/, "").slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audio Elements */}
      {selectedStudySound !== "none" && (
        <audio
          ref={studyAudioRef}
          preload="auto"
          src={`/sounds/study/${selectedStudySound}`}
        />
      )}

      {selectedAlarmSound !== "none" && (
        <audio
          ref={alarmAudioRef}
          preload="auto"
          src={`/sounds/alarms/${selectedAlarmSound}`}
        />
      )}

      {/* Alarm Popup Modal */}
      {showAlarmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred background overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Popup modal */}
          <div className="relative z-10 bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/30 text-center max-w-md mx-auto">
            <div className="mb-6">
              <div
                className={`w-16 h-16 ${
                  completedSessionType ? "bg-[#fcb96d]/20" : "bg-[#6db0fc]/20"
                } rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <svg
                  className={`w-8 h-8 ${
                    completedSessionType ? "text-[#fcb96d]" : "text-[#6db0fc]"
                  }`}
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
              <h2 className="text-2xl font-bold text-white mb-2">
                Timer Finished!
              </h2>
              <p className="text-white/80">
                Your {completedSessionType ? "break" : "focus"} session is
                complete. Great job!
              </p>
            </div>

            <button
              onClick={stopAlarm}
              className={`${
                completedSessionType
                  ? "bg-[#936dfc] hover:bg-[#b896fc]"
                  : "bg-[#8ace00] hover:bg-[#c6e783]"
              } text-black font-medium py-3 px-8 rounded-lg transition-colors w-full`}
            >
              Stop Alarm
            </button>
          </div>
        </div>
      )}
    </>
  );
}
