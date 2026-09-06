"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RefreshCw, Users } from "lucide-react";

export default function MultiAgentSim() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"coop" | "comp">("coop");
  const [score, setScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Agent states
  const agent1 = useRef({ x: 50, y: 80, vx: 0, vy: 0, size: 8, color: "#22d3ee" }); // Cyan
  const agent2 = useRef({ x: 190, y: 80, vx: 0, vy: 0, size: 8, color: "#a78bfa" }); // Purple/Red in comp
  const target = useRef({ x: 120, y: 40, size: 6, color: "#10b981" }); // Green food
  
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset positions on mode change
    resetSimulation();
  }, [mode]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const resetSimulation = () => {
    agent1.current = { x: 40, y: 60, vx: 0, vy: 0, size: 8, color: "#22d3ee" };
    if (mode === "coop") {
      agent2.current = { x: 200, y: 100, vx: 0, vy: 0, size: 8, color: "#a78bfa" };
      target.current = { x: 120, y: 80, size: 6, color: "#10b981" };
    } else {
      agent2.current = { x: 200, y: 100, vx: 0, vy: 0, size: 10, color: "#f43f5e" }; // Predator (red/pink)
      target.current = { x: -100, y: -100, size: 0, color: "" }; // No food in tag
    }
    setScore(0);
    draw();
  };

  const updatePhysics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;

    // AI Logic (Simple rule-based controllers simulating learned policies)
    if (mode === "coop") {
      // Both agents move towards the green target
      const moveTowards = (agent: typeof agent1.current) => {
        const dx = target.current.x - agent.x;
        const dy = target.current.y - agent.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 2) {
          agent.vx = (dx / dist) * 1.8;
          agent.vy = (dy / dist) * 1.8;
        } else {
          agent.vx = 0;
          agent.vy = 0;
        }
      };

      moveTowards(agent1.current);
      moveTowards(agent2.current);

      // Check collision with target
      const checkCollision = (agent: typeof agent1.current) => {
        const dx = target.current.x - agent.x;
        const dy = target.current.y - agent.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < agent.size + target.current.size) {
          // Success! Respawn target
          target.current.x = 20 + Math.random() * (width - 40);
          target.current.y = 20 + Math.random() * (height - 40);
          setScore((s) => s + 1);
        }
      };

      checkCollision(agent1.current);
      checkCollision(agent2.current);

    } else {
      // Competitive Tag mode: Agent 1 (Cyan) runs away, Agent 2 (Red) chases Agent 1
      
      // Chaser (Agent 2) logic
      const dx = agent1.current.x - agent2.current.x;
      const dy = agent1.current.y - agent2.current.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 2) {
        agent2.current.vx = (dx / dist) * 1.6;
        agent2.current.vy = (dy / dist) * 1.6;
      }

      // Runner (Agent 1) logic - runs away from Agent 2, with boundary avoidance
      const dxEscape = agent1.current.x - agent2.current.x;
      const dyEscape = agent1.current.y - agent2.current.y;
      const distEscape = Math.sqrt(dxEscape*dxEscape + dyEscape*dyEscape);
      
      let vx = (dxEscape / distEscape) * 2.0;
      let vy = (dyEscape / distEscape) * 2.0;

      // Add wall avoidance forces
      if (agent1.current.x < 30) vx += 1.5;
      if (agent1.current.x > width - 30) vx -= 1.5;
      if (agent1.current.y < 30) vy += 1.5;
      if (agent1.current.y > height - 30) vy -= 1.5;

      agent1.current.vx = vx;
      agent1.current.vy = vy;

      // Check tag collision
      if (dist < agent1.current.size + agent2.current.size) {
        // Tagged! Reset runner to a random side and increment score
        agent1.current.x = Math.random() < 0.5 ? 40 : width - 40;
        agent1.current.y = Math.random() < 0.5 ? 40 : height - 40;
        setScore((s) => s + 1);
      }
    }

    // Apply movement
    const applyMovement = (agent: typeof agent1.current) => {
      agent.x += agent.vx;
      agent.y += agent.vy;
      // Boundaries check
      if (agent.x < agent.size) agent.x = agent.size;
      if (agent.x > width - agent.size) agent.x = width - agent.size;
      if (agent.y < agent.size) agent.y = agent.size;
      if (agent.y > height - agent.size) agent.y = height - agent.size;
    };

    applyMovement(agent1.current);
    applyMovement(agent2.current);

    draw();
    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#02000c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.02)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw target (food)
    if (mode === "coop") {
      ctx.beginPath();
      ctx.arc(target.current.x, target.current.y, target.current.size, 0, Math.PI * 2);
      ctx.fillStyle = target.current.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = target.current.color;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset
    }

    // Draw Agent 1
    ctx.beginPath();
    ctx.arc(agent1.current.x, agent1.current.y, agent1.current.size, 0, Math.PI * 2);
    ctx.fillStyle = agent1.current.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = agent1.current.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Agent 2
    ctx.beginPath();
    ctx.arc(agent2.current.x, agent2.current.y, agent2.current.size, 0, Math.PI * 2);
    ctx.fillStyle = agent2.current.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = agent2.current.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // Draw once on mount
  useEffect(() => {
    draw();
  }, []);

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="font-bold text-white text-sm">Simulation MARL (Multi-Agent RL)</h4>
          <p className="text-xs text-gray-400 mt-1">Sélectionnez le mode d'interaction pour voir les comportements co-appris.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("coop")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all focus:outline-none ${
              mode === "coop"
                ? "bg-cyan-950/40 border-cyan-500 text-cyan-300"
                : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            Coopératif
          </button>
          <button
            onClick={() => setMode("comp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all focus:outline-none ${
              mode === "comp"
                ? "bg-rose-950/40 border-rose-500 text-rose-300"
                : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            Compétitif (Tag)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Canvas Area */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="border border-violet-500/20 rounded-xl overflow-hidden shadow-2xl relative bg-black">
            <canvas
              ref={canvasRef}
              width="360"
              height="200"
              className="max-w-full aspect-video block"
            />
            {/* Overlay score info */}
            <div className="absolute top-3 left-4 text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-black/60 px-2.5 py-1 rounded border border-white/5 backdrop-blur-sm">
              {mode === "coop" ? "Cibles capturées" : "Tags réussis"} : {score}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all focus:outline-none shadow-md"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              {isPlaying ? "Pause" : "Lancer"}
            </button>
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs transition-all focus:outline-none"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* MARL Explanations card */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
            <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-2.5 flex items-center gap-1">
              <Users size={14} className="text-violet-400" /> Non-Stationnarité
            </h5>
            {mode === "coop" ? (
              <p className="text-xs text-gray-300 leading-relaxed">
                <strong>Mode Coopératif :</strong> Les deux agents (Cyan et Violet) partagent un objectif commun (💎). Ils doivent coordonner leurs trajectoires. L'environnement reste stationnaire si leurs politiques s'accordent.
              </p>
            ) : (
              <p className="text-xs text-gray-300 leading-relaxed">
                <strong>Mode Compétitif (Chat & Souris) :</strong> Le chasseur (Rose 🔥) apprend à rattraper la proie (Cyan 🤖). Dès que le chasseur s'améliore, la proie doit modifier sa politique pour survivre, changeant ainsi le comportement global du système. C'est l'essence de la non-stationnarité.
              </p>
            )}
          </div>

          <div className="text-[10px] text-gray-400 leading-relaxed bg-white/5 border border-white/5 p-3 rounded-lg">
            <strong className="text-cyan-400">Pourquoi c'est difficile ?</strong> En MARL, la règle de transition de Markov $P(s'|s,a)$ n'est plus stable du point de vue d'un agent unique car $a$ est un vecteur d'actions conjointes de tous les agents.
          </div>
        </div>
      </div>
    </div>
  );
}
