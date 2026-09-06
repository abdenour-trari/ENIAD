import pickle
import numpy as np

class GestureClassifier:
    def __init__(self, model_path):
        with open(model_path, "rb") as f:
            self.model = pickle.load(f)

    def predict(self, hand_landmarks):
        data = []
        for lm in hand_landmarks.landmark:
            data.extend([lm.x, lm.y, lm.z])

        prediction = self.model.predict([data])
        return prediction[0]
