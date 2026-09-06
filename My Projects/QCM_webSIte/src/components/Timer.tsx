import React, { useEffect, useState } from 'react';
import { Timer as TimerIcon, AlertTriangle } from 'lucide-react';

interface TimerProps {
  initialSeconds: number; // Duration of exam in seconds
  isActive: boolean;
  isCountDown?: boolean;
  onTimeUp?: () => void;
  onTick?: (secondsRemainingOrElapsed: number) => void;
}

export const Timer: React.FC<TimerProps> = ({
  initialSeconds,
  isActive,
  isCountDown = true,
  onTimeUp,
  onTick,
}) => {
  const [time, setTime] = useState(initialSeconds);

  useEffect(() => {
    setTime(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTime((prevTime) => {
        const nextTime = isCountDown ? prevTime - 1 : prevTime + 1;
        
        if (onTick) {
          onTick(nextTime);
        }

        if (isCountDown && nextTime <= 0) {
          clearInterval(interval);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isCountDown, onTimeUp, onTick]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isLowTime = isCountDown && time <= 60; // 1 minute left
  const isCriticalTime = isCountDown && time <= 20; // 20 seconds left

  let timerColor = 'text-blue-400 border-blue-500/20 bg-blue-950/20';
  if (isCountDown) {
    if (isCriticalTime) {
      timerColor = 'text-rose-400 border-rose-500/30 bg-rose-950/30 animate-pulse';
    } else if (isLowTime) {
      timerColor = 'text-amber-400 border-amber-500/30 bg-amber-950/30';
    }
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-colors ${timerColor}`}>
      {isCriticalTime ? (
        <AlertTriangle className="h-4 w-4 text-rose-500" />
      ) : (
        <TimerIcon className="h-4 w-4 opacity-80" />
      )}
      <span className="tabular-nums">{formatTime(time)}</span>
    </div>
  );
};
