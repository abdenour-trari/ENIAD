import mediapipe as mp
import cv2

class HandTracker:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7
        )
        self.drawer = mp.solutions.drawing_utils

    def detect(self, frame):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb)
        return results.multi_hand_landmarks

    @staticmethod
    def index_tip(landmarks, width, height):
        lm = landmarks.landmark[8]
        return int(lm.x * width), int(lm.y * height)
