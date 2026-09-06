"use client";

import React, { useState } from "react";
import { Play, Sparkles, RefreshCw, Sliders } from "lucide-react";

export default function ActorCriticVis() {
  const [isFlowAnimating, setIsFlowAnimating] = useState(false);
  const [ppoEpsilon, setPpoEpsilon] = useState(0.2); // Default PPO clipping (0.2)
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const startFlowAnimation = () => {
    if (isFlowAnimating) return;
    setIsFlowAnimating(true);
    setActiveStep(0);

    const steps = [0, 1, 2, 3]; // 0: Actor choices action -> 1: Env step -> 2: Critic evaluates -> 3: Advantage guides Actor
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= steps.length) {
        clearInterval(interval);
        setIsFlowAnimating(false);
        setActiveStep(null);
      } else {
        setActiveStep(current);
      }
    }, 1200);
  };

  // Helper for drawing PPO clipping graph coordinates
  const getPpoGraphPath = (epsilon: number) => {
    // Math graph plotting for the clip function
    // X goes from 0.5 (left) to 1.5 (right) -> represented as pixels 50 to 350
    // Y goes from -0.5 (bottom) to 1.2 (top) -> represented as pixels 220 to 40
    const startX = 50;
    const endX = 350;
    const centerY = 120; // 0 line
    
    // Draw the clipped line: min(r*A, clip(r, 1-eps, 1+eps)*A) for Positive Advantage
    // When r < 1-eps, it's linear: y = r * A
    // When 1-eps <= r <= 1+eps, it's linear
    // When r > 1+eps, it's flat: y = (1+eps) * A
    const xForR = (r: number) => 50 + (r - 0.5) * 300;
    const yForVal = (v: number) => 120 - v * 80;

    const rMin = 1 - epsilon;
    const rMax = 1 + epsilon;

    const p1 = `${xForR(0.5)},${yForVal(0.5 * 0.8)}`;
    const p2 = `${xForR(rMin)},${yForVal(rMin * 0.8)}`;
    const p3 = `${xForR(rMax)},${yForVal(rMax * 0.8)}`;
    const p4 = `${xForR(1.5)},${yForVal(rMax * 0.8)}`;

    return `M ${p1} L ${p2} L ${p3} L ${p4}`;
  };

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Actor Critic Loop Animation */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Boucle Acteur-Critique
              </h5>
              <p className="text-[10px] text-gray-500 mt-0.5">Appuyez pour voir le flux de données en temps réel.</p>
            </div>
            <button
              onClick={startFlowAnimation}
              disabled={isFlowAnimating}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 hover:border-cyan-500 text-cyan-300 text-xs font-semibold transition-all focus:outline-none disabled:opacity-40"
            >
              <Play size={10} /> {isFlowAnimating ? "Simulation..." : "Lancer Flux"}
            </button>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-[280px] relative overflow-hidden">
            {/* Loop Diagram */}
            <div className="flex items-center justify-around h-[160px] relative">
              {/* Actor Box */}
              <div className={`z-10 p-3 rounded-lg border text-center font-bold text-xs transition-all w-24 ${
                activeStep === 0 || activeStep === 3
                  ? "bg-cyan-950 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/25"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}>
                ACTEUR<br/>
                <span className="text-[9px] font-normal text-gray-500">$\pi_\theta(a|s)$</span>
              </div>

              {/* Critic Box */}
              <div className={`z-10 p-3 rounded-lg border text-center font-bold text-xs transition-all w-24 ${
                activeStep === 2
                  ? "bg-violet-950 border-violet-400 text-violet-200 ring-2 ring-violet-500/25"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}>
                CRITIQUE<br/>
                <span className="text-[9px] font-normal text-gray-500">$V_\phi(s)$</span>
              </div>

              {/* Env Box (Bottom) */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 z-10 p-2.5 rounded-lg border text-center font-bold text-xs transition-all w-32 ${
                activeStep === 1
                  ? "bg-emerald-950 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/25"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}>
                ENVIRONNEMENT
              </div>

              {/* Connector lines & labels */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Actor -> Env */}
                <path d="M 90 90 Q 90 140 150 140" fill="none" stroke={activeStep === 0 ? "#22d3ee" : "rgba(255,255,255,0.05)"} strokeWidth="1.5" />
                {/* Env -> Critic */}
                <path d="M 230 140 Q 290 140 290 90" fill="none" stroke={activeStep === 1 ? "#34d399" : "rgba(255,255,255,0.05)"} strokeWidth="1.5" />
                {/* Critic -> Actor */}
                <path d="M 240 60 L 140 60" fill="none" stroke={activeStep === 2 ? "#a78bfa" : "rgba(255,255,255,0.05)"} strokeWidth="1.5" />
              </svg>
            </div>

            {/* Step Explanation text */}
            <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-[10px] text-gray-300 leading-relaxed min-h-[70px]">
              {activeStep === null && "Cliquez sur 'Lancer Flux' pour voir comment l'Acteur et le Critique collaborent pas à pas."}
              {activeStep === 0 && "Étape 1 : L'Acteur choisit une action 'a' selon sa politique actuelle et l'envoie à l'Environnement."}
              {activeStep === 1 && "Étape 2 : L'Environnement réagit, renvoie un nouvel état et une récompense 'r' au Critique."}
              {activeStep === 2 && "Étape 3 : Le Critique calcule l'erreur TD et estime la valeur d'Avantage A(s, a)."}
              {activeStep === 3 && "Étape 4 : L'Avantage est renvoyé à l'Acteur pour renforcer (si A > 0) ou atténuer (si A < 0) cette action."}
            </div>
          </div>
        </div>

        {/* Right: PPO Clipping Graph */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sliders size={12} className="text-cyan-400" /> Zone de Clipping PPO
              </h5>
              <p className="text-[10px] text-gray-500 mt-0.5">Ajustez epsilon pour modifier la zone de confiance.</p>
            </div>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-[280px]">
            {/* SVG Graph */}
            <div className="flex justify-center bg-black/60 rounded-lg p-1 relative">
              <svg width="380" height="170" className="max-w-full">
                {/* Horizontal / Vertical Axis */}
                <line x1="50" y1="120" x2="360" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1="200" y1="20" x2="200" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                
                {/* Graph Axis Labels */}
                <text x="360" y="132" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="end">Ratio r(θ)</text>
                <text x="208" y="28" fill="rgba(255,255,255,0.4)" fontSize="8">Objectif L</text>
                <text x="200" y="132" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">1.0</text>

                {/* Safe / Clip regions vertical shaded areas */}
                <rect 
                  x={200 - ppoEpsilon * 150} 
                  y="20" 
                  width={ppoEpsilon * 300} 
                  height="130" 
                  fill="rgba(16,185,129,0.06)" 
                  stroke="rgba(16,185,129,0.15)"
                  strokeDasharray="2, 2"
                />
                
                <text 
                  x="200" 
                  y="45" 
                  fill="#10b981" 
                  fontSize="8" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  ZONE DE CONFIANCE
                </text>

                {/* Draw clipped function */}
                <path 
                  d={getPpoGraphPath(ppoEpsilon)} 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="2" 
                />
                
                {/* Highlight parameters on x axis */}
                <text x={200 - ppoEpsilon * 150} y="132" fill="#ec4899" fontSize="7" textAnchor="middle">
                  1-ε
                </text>
                <text x={200 + ppoEpsilon * 150} y="132" fill="#ec4899" fontSize="7" textAnchor="middle">
                  1+ε
                </text>
              </svg>
            </div>

            {/* Slider control */}
            <div className="flex items-center gap-4 border-t border-white/5 pt-3">
              <label className="text-[11px] text-gray-300 font-bold shrink-0">Epsilon ($\epsilon$) :</label>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.01"
                value={ppoEpsilon}
                onChange={(e) => setPpoEpsilon(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <span className="font-mono text-xs text-violet-400 font-bold shrink-0">{ppoEpsilon.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
