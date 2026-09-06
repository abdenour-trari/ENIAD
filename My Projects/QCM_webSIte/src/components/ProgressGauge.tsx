import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressGaugeProps {
  percentage: number; // 0 to 100
  score: number;
  total: number;
  size?: number;
}

export const ProgressGauge: React.FC<ProgressGaugeProps> = ({
  percentage,
  score,
  total,
  size = 200,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    // Animate percentage text on load
    const duration = 1200; // ms
    const stepTime = Math.abs(Math.floor(duration / percentage));
    let start = 0;
    
    if (percentage === 0) return;

    const timer = setInterval(() => {
      start += 1;
      setAnimatedValue(start);
      if (start >= percentage) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [percentage]);

  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = 'stroke-rose-500';
  let glowColor = 'shadow-rose-500/20';
  let textColor = 'text-rose-400';
  let label = 'À retravailler';

  if (percentage >= 80) {
    color = 'stroke-emerald-500';
    glowColor = 'shadow-emerald-500/20';
    textColor = 'text-emerald-400';
    label = 'Excellent !';
  } else if (percentage >= 50) {
    color = 'stroke-blue-500';
    glowColor = 'shadow-blue-500/20';
    textColor = 'text-blue-400';
    label = 'Validé';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${glowColor}`} />
        
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background Ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground Ring */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            className={`${color} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            strokeLinecap="round"
          />
        </svg>

        {/* Text Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-slate-100 tracking-tight">
            {animatedValue}%
          </span>
          <span className="text-sm font-semibold text-slate-400 mt-1">
            {score} / {total} correct
          </span>
        </div>
      </div>
      <div className={`mt-4 font-bold text-lg tracking-wide uppercase ${textColor}`}>
        {label}
      </div>
    </div>
  );
};
