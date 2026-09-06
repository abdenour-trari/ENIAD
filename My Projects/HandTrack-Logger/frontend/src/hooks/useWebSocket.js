import { useEffect, useRef, useState } from "react";

function useWebSocket() {
  const wsRef = useRef(null);

  const [pointerData, setPointerData] = useState({
    x: null,
    y: null,
    pinch: false,
  });

  const [aiFeedback, setAiFeedback] = useState("");
  const [encouragement, setEncouragement] = useState("");

  const isProcessing = useRef(false);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://127.0.0.1:8000/ws");

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // AI feedback
      if (data.type === "ai_feedback") {
        setAiFeedback(data.feedback);
        setEncouragement(data.encouragement);
        return;
      }

      // pointer
      setPointerData(data);
      isProcessing.current = false;
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => wsRef.current.close();
  }, []);

  const sendFrame = (video) => {
    if (!wsRef.current) return;
    if (wsRef.current.readyState !== 1) return;
    if (isProcessing.current) return;
    if (!video) return;
    if (video.videoWidth === 0) return;

    isProcessing.current = true;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = 160;
    tempCanvas.height = 120;

    tempCtx.drawImage(video, 0, 0, 160, 120);

    const base64 = tempCanvas.toDataURL("image/jpeg", 0.5).split(",")[1];

    wsRef.current.send(base64);
  };

  const sendMotorData = (motorData) => {
    if (!wsRef.current) return;
    if (wsRef.current.readyState !== 1) return;

    wsRef.current.send(
      JSON.stringify({
        type: "motor_analysis",
        data: motorData,
      }),
    );
  };

  return {
    pointerData,
    aiFeedback,
    encouragement,
    sendFrame,
    sendMotorData,
  };
}

export default useWebSocket;
