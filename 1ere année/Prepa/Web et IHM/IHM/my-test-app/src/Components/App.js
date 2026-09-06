import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";

const TSPVisualization = () => {
  const [cities, setCities] = useState([]);
  const [gaPath, setGaPath] = useState([]);
  const [acoPath, setAcoPath] = useState([]);
  const [gaDistance, setGaDistance] = useState(0);
  const [acoDistance, setAcoDistance] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [algorithm, setAlgorithm] = useState("both");
  const [numCities, setNumCities] = useState(10);

  // Génération des villes
  const generateCities = (n) => {
    const newCities = [];
    for (let i = 0; i < n; i++) {
      newCities.push({
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        id: i,
      });
    }
    setCities(newCities);
    setGaPath([]);
    setAcoPath([]);
    setGaDistance(0);
    setAcoDistance(0);
    setProgress(0);
  };

  useEffect(() => {
    generateCities(numCities);
  }, [numCities]);

  // Calcul de distance
  const distance = (c1, c2) => {
    return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
  };

  const totalDistance = (path, cityList) => {
    let dist = 0;
    for (let i = 0; i < path.length; i++) {
      const current = cityList[path[i]];
      const next = cityList[path[(i + 1) % path.length]];
      dist += distance(current, next);
    }
    return dist;
  };

  // Algorithme Génétique simplifié
  const runGA = (cityList) => {
    const N = cityList.length;
    const POP_SIZE = 50;
    const GENERATIONS = 100;
    const MUTATION_RATE = 0.02;

    const createIndividual = () => {
      const path = Array.from({ length: N }, (_, i) => i);
      for (let i = path.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [path[i], path[j]] = [path[j], path[i]];
      }
      return path;
    };

    const selection = (population) => {
      const a = population[Math.floor(Math.random() * population.length)];
      const b = population[Math.floor(Math.random() * population.length)];
      return totalDistance(a, cityList) < totalDistance(b, cityList) ? a : b;
    };

    const crossover = (p1, p2) => {
      const start = Math.floor(Math.random() * N);
      const end = start + Math.floor(Math.random() * (N - start));
      const child = new Array(N).fill(-1);

      for (let i = start; i < end; i++) {
        child[i] = p1[i];
      }

      let ptr = 0;
      for (let city of p2) {
        if (!child.includes(city)) {
          while (child[ptr] !== -1) ptr++;
          child[ptr] = city;
        }
      }
      return child;
    };

    const mutate = (ind) => {
      if (Math.random() < MUTATION_RATE) {
        const i = Math.floor(Math.random() * N);
        const j = Math.floor(Math.random() * N);
        [ind[i], ind[j]] = [ind[j], ind[i]];
      }
    };

    let population = Array.from({ length: POP_SIZE }, () => createIndividual());

    for (let gen = 0; gen < GENERATIONS; gen++) {
      const newPop = [];
      for (let i = 0; i < POP_SIZE; i++) {
        const p1 = selection(population);
        const p2 = selection(population);
        const child = crossover(p1, p2);
        mutate(child);
        newPop.push(child);
      }
      population = newPop;
    }

    return population.reduce((best, current) =>
      totalDistance(current, cityList) < totalDistance(best, cityList)
        ? current
        : best
    );
  };

  // Algorithme de Colonies de Fourmis simplifié
  const runACO = (cityList) => {
    const N = cityList.length;
    const ANTS = 20;
    const ITERATIONS = 100;
    const ALPHA = 1;
    const BETA = 5;
    const EVAPORATION = 0.5;
    const Q = 100;

    const distMatrix = cityList.map((c1) =>
      cityList.map((c2) => distance(c1, c2))
    );

    let pheromone = Array(N)
      .fill(0)
      .map(() => Array(N).fill(1));
    let bestPath = null;
    let bestDist = Infinity;

    const chooseNext = (current, unvisited) => {
      const probs = unvisited.map((city) => {
        const tau = Math.pow(pheromone[current][city], ALPHA);
        const eta = Math.pow(1 / (distMatrix[current][city] + 0.001), BETA);
        return tau * eta;
      });

      const total = probs.reduce((a, b) => a + b, 0);
      const r = Math.random() * total;
      let sum = 0;

      for (let i = 0; i < unvisited.length; i++) {
        sum += probs[i];
        if (sum >= r) return unvisited[i];
      }
      return unvisited[unvisited.length - 1];
    };

    for (let iter = 0; iter < ITERATIONS; iter++) {
      const allPaths = [];

      for (let ant = 0; ant < ANTS; ant++) {
        const path = [Math.floor(Math.random() * N)];
        const unvisited = new Set(Array.from({ length: N }, (_, i) => i));
        unvisited.delete(path[0]);

        while (unvisited.size > 0) {
          const next = chooseNext(path[path.length - 1], Array.from(unvisited));
          path.push(next);
          unvisited.delete(next);
        }

        allPaths.push(path);
        const d = totalDistance(path, cityList);
        if (d < bestDist) {
          bestDist = d;
          bestPath = path;
        }
      }

      // Évaporation
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          pheromone[i][j] *= 1 - EVAPORATION;
        }
      }

      // Dépôt
      for (let path of allPaths) {
        const d = totalDistance(path, cityList);
        for (let i = 0; i < N; i++) {
          pheromone[path[i]][path[(i + 1) % N]] += Q / d;
        }
      }
    }

    return bestPath;
  };

  const runAlgorithms = async () => {
    if (cities.length < 3) return;

    setIsRunning(true);
    setProgress(0);

    const runWithProgress = (algo, setter, distSetter) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = algo(cities);
          setter(result);
          distSetter(totalDistance(result, cities));
          resolve();
        }, 100);
      });
    };

    if (algorithm === "ga" || algorithm === "both") {
      setProgress(25);
      await runWithProgress(runGA, setGaPath, setGaDistance);
      setProgress(50);
    }

    if (algorithm === "aco" || algorithm === "both") {
      setProgress(75);
      await runWithProgress(runACO, setAcoPath, setAcoDistance);
      setProgress(100);
    }

    setIsRunning(false);
  };

  const drawPath = (path, color) => {
    if (path.length === 0) return null;

    const pathString =
      path
        .map((idx, i) => {
          const city = cities[idx];
          return `${i === 0 ? "M" : "L"} ${city.x} ${city.y}`;
        })
        .join(" ") + " Z";

    return (
      <path
        d={pathString}
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.7"
      />
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          🧬 Visualisation TSP : Algorithme Génétique vs Colonies de Fourmis 🐜
        </h1>

        {/* Contrôles */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-xl border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-slate-300 text-sm mb-2 block">
                Nombre de villes
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={numCities}
                onChange={(e) => setNumCities(parseInt(e.target.value))}
                className="w-full"
                disabled={isRunning}
              />
              <div className="text-white text-center mt-1">{numCities}</div>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-2 block">
                Algorithme
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full bg-slate-700 text-white p-2 rounded"
                disabled={isRunning}
              >
                <option value="both">Les deux</option>
                <option value="ga">Génétique uniquement</option>
                <option value="aco">Fourmis uniquement</option>
              </select>
            </div>

            <button
              onClick={runAlgorithms}
              disabled={isRunning || cities.length < 3}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? "Calcul..." : "Lancer"}
            </button>

            <button
              onClick={() => generateCities(numCities)}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw size={20} />
              Nouvelles villes
            </button>
          </div>

          {isRunning && (
            <div className="mt-4">
              <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Visualisation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Algorithme Génétique */}
          {(algorithm === "ga" || algorithm === "both") && (
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
              <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                🧬 Algorithme Génétique
              </h2>
              <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <svg
                  width="100%"
                  height="500"
                  className="border border-slate-700 rounded"
                >
                  {drawPath(gaPath, "#10b981")}
                  {cities.map((city, idx) => (
                    <g key={idx}>
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r="8"
                        fill="#10b981"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      <text
                        x={city.x}
                        y={city.y}
                        textAnchor="middle"
                        dy="4"
                        className="text-xs fill-white font-bold"
                      >
                        {idx}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              {gaPath.length > 0 && (
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-slate-300">
                    <strong className="text-white">Distance:</strong>{" "}
                    {gaDistance.toFixed(2)} unités
                  </p>
                  <p className="text-slate-300 text-sm mt-2">
                    <strong className="text-white">Chemin:</strong>{" "}
                    {gaPath.join(" → ")} → {gaPath[0]}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Colonies de Fourmis */}
          {(algorithm === "aco" || algorithm === "both") && (
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
              <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                🐜 Colonies de Fourmis
              </h2>
              <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <svg
                  width="100%"
                  height="500"
                  className="border border-slate-700 rounded"
                >
                  {drawPath(acoPath, "#f97316")}
                  {cities.map((city, idx) => (
                    <g key={idx}>
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r="8"
                        fill="#f97316"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      <text
                        x={city.x}
                        y={city.y}
                        textAnchor="middle"
                        dy="4"
                        className="text-xs fill-white font-bold"
                      >
                        {idx}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              {acoPath.length > 0 && (
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-slate-300">
                    <strong className="text-white">Distance:</strong>{" "}
                    {acoDistance.toFixed(2)} unités
                  </p>
                  <p className="text-slate-300 text-sm mt-2">
                    <strong className="text-white">Chemin:</strong>{" "}
                    {acoPath.join(" → ")} → {acoPath[0]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparaison */}
        {gaPath.length > 0 && acoPath.length > 0 && algorithm === "both" && (
          <div className="bg-slate-800 rounded-lg p-6 mt-6 shadow-xl border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="text-yellow-400" />
              Comparaison des résultats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-900/30 rounded-lg p-4 border-2 border-green-500">
                <p className="text-green-400 font-semibold">
                  Algorithme Génétique
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {gaDistance.toFixed(2)}
                </p>
              </div>
              <div className="bg-orange-900/30 rounded-lg p-4 border-2 border-orange-500">
                <p className="text-orange-400 font-semibold">
                  Colonies de Fourmis
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {acoDistance.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-900/30 rounded-lg p-4 border-2 border-blue-500">
                <p className="text-blue-400 font-semibold">
                  Meilleur algorithme
                </p>
                <p className="text-2xl font-bold text-white mt-2">
                  {gaDistance < acoDistance ? "🧬 Génétique" : "🐜 Fourmis"}
                </p>
                <p className="text-slate-300 text-sm mt-1">
                  Écart: {Math.abs(gaDistance - acoDistance).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TSPVisualization;
