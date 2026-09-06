import { useEffect, useRef } from "react";
import useWebSocket from "../hooks/useWebSocket";
import useMotorAnalysis from "../hooks/useMotorAnalysis";

function Canvas() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const { pointerData, aiFeedback, encouragement, sendFrame, sendMotorData } =
    useWebSocket();

  const {
    point,
    select,
    precision,
    accuracy,
    responseTime,
    updateMotor,
    updatePrecision,
    registerClick,
    getMotorData,
  } = useMotorAnalysis();

  useEffect(() => {
    const interval = setInterval(() => {
      sendMotorData(getMotorData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://127.0.0.1:8000/ws");

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        className="bg-white rounded-xl shadow"
      />

      <video ref={videoRef} autoPlay className="hidden" />
    </div>
  );
}

export default Canvas;
