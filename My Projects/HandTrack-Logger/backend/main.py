from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import cv2
import numpy as np
import base64
import json

from services.ai_feedback import generate_ai_feedback
from core.hand_tracker import HandTracker
from config.settings import *

app = FastAPI()

tracker = HandTracker(MODEL_PATH)


def is_pinch(hand_landmarks):
    thumb = hand_landmarks[4]
    index = hand_landmarks[8]

    dist = ((thumb.x - index.x) ** 2 + (thumb.y - index.y) ** 2) ** 0.5
    return dist < 0.05


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    try:
        while True:

            message = await websocket.receive()

            # ===============================
            # AI MOTOR ANALYSIS
            # ===============================

            if "text" in message:

                text_data = message["text"]

                try:
                    data = json.loads(text_data)

                    if data.get("type") == "motor_analysis":

                        ai_result = generate_ai_feedback(
                            data["data"]
                        )

                        await websocket.send_json({
                            "type": "ai_feedback",
                            "feedback": ai_result["feedback"],
                            "encouragement": ai_result["encouragement"]
                        })

                        continue

                except:
                    pass

                # ===============================
                # FRAME PROCESSING
                # ===============================

                img_bytes = base64.b64decode(text_data)
                np_arr = np.frombuffer(img_bytes, np.uint8)

                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if frame is None:
                    await websocket.send_json({
                        "x": None,
                        "y": None,
                        "pinch": False
                    })
                    continue

                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                result = tracker.detect(frame_rgb)

                if result.hand_landmarks:

                    hand = result.hand_landmarks[0]
                    index = hand[8]

                    pinch = is_pinch(hand)

                    await websocket.send_json({
                        "x": index.x,
                        "y": index.y,
                        "pinch": pinch
                    })

                else:

                    await websocket.send_json({
                        "x": None,
                        "y": None,
                        "pinch": False
                    })

    except WebSocketDisconnect:
        print("🔌 Client disconnected")

    except Exception as e:
        print("❌ ERROR:", e)