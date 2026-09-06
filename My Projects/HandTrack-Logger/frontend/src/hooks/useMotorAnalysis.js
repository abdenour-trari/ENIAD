import { useState, useRef } from "react";

function useMotorAnalysis() {
  const [point, setPoint] = useState(0);
  const [select, setSelect] = useState(0);
  const [precision, setPrecision] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [responseTime, setResponseTime] = useState(0);

  const pointerHistory = useRef([]);
  const precisionValues = useRef([]);

  const totalClicks = useRef(0);
  const correctClicks = useRef(0);
  const startTime = useRef(Date.now());

  const updateMotor = (pointer) => {
    if (!pointer) return;

    pointerHistory.current.push(pointer);

    if (pointerHistory.current.length > 10) pointerHistory.current.shift();

    if (pointerHistory.current.length > 1) {
      let totalMove = 0;

      for (let i = 1; i < pointerHistory.current.length; i++) {
        let dx = pointerHistory.current[i].x - pointerHistory.current[i - 1].x;

        let dy = pointerHistory.current[i].y - pointerHistory.current[i - 1].y;

        totalMove += Math.sqrt(dx * dx + dy * dy);
      }

      let stability = Math.max(0, 100 - totalMove / 5);
      setPoint(Math.round(stability));
    }

    if (totalClicks.current > 0) {
      let acc = (correctClicks.current / totalClicks.current) * 100;

      setAccuracy(Math.round(acc));
      setSelect(Math.round(acc));
    }

    let time = (Date.now() - startTime.current) / 1000;
    setResponseTime(time.toFixed(1));
  };

  const updatePrecision = (value) => {
    precisionValues.current.push(value);

    if (precisionValues.current.length > 20) precisionValues.current.shift();

    const avg =
      precisionValues.current.reduce((a, b) => a + b, 0) /
      precisionValues.current.length;

    setPrecision(Math.round(avg));
  };

  const registerClick = (correct) => {
    totalClicks.current++;

    if (correct) correctClicks.current++;
  };

  const getMotorData = () => {
    return {
      stability: point + "%",
      precision: precision + "%",
      select: select + "%",
      accuracy: accuracy + "%",
      response_time: responseTime + "s",
    };
  };

  return {
    point,
    select,
    precision,
    accuracy,
    responseTime,
    updateMotor,
    updatePrecision,
    registerClick,
    getMotorData,
  };
}

export default useMotorAnalysis;
