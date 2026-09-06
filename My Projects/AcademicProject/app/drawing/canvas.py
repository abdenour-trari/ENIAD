import cv2
import numpy as np

class VirtualCanvas:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.strokes = []        # liste de lettres
        self.current_stroke = []

    def start_stroke(self):
        if self.current_stroke:
            self.strokes.append(self.current_stroke)
        self.current_stroke = []

    def add_point(self, x, y):
        self.current_stroke.append((x, y))

    def erase_last(self):
        if self.strokes:
            self.strokes.pop()

    def draw(self):
        canvas = np.zeros((self.height, self.width, 3), dtype=np.uint8)

        for stroke in self.strokes:
            for i in range(1, len(stroke)):
                cv2.line(canvas, stroke[i-1], stroke[i], (255, 0, 255), 5)

        for i in range(1, len(self.current_stroke)):
            cv2.line(canvas,
                     self.current_stroke[i-1],
                     self.current_stroke[i],
                     (255, 0, 255),
                     5)

        return canvas
