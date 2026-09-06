import cv2

from vision.camera import Camera
from vision.hand_tracker import HandTracker
from gestures.gesture_classifier import GestureClassifier
from gestures.gesture_logic import GestureLogic
from drawing.canvas import VirtualCanvas

camera = Camera()
tracker = HandTracker()
classifier = GestureClassifier("model/model.pickle")

frame = camera.read()
h, w, _ = frame.shape
canvas = VirtualCanvas(w, h)

writing_enabled = False
last_action = None

print("[INFO] Appuie sur 'E' pour activer l'écriture")
print("[INFO] Appuie sur 'Q' pour quitter")

while True:
    frame = camera.read()
    if frame is None:
        break

    hands = tracker.detect(frame)

    if hands:
        hand = hands[0]
        label = classifier.predict(hand)
        action = GestureLogic.from_label(label)

        x, y = tracker.index_tip(hand, w, h)

        if action == GestureLogic.DRAW and writing_enabled:
            if last_action != GestureLogic.DRAW:
                canvas.start_stroke()
            canvas.add_point(x, y)

        elif action == GestureLogic.ERASE:
            canvas.erase_last()

        last_action = action

    drawing = canvas.draw()
    output = cv2.addWeighted(frame, 1, drawing, 1, 0)

    cv2.imshow("Virtual Writing", output)

    key = cv2.waitKey(1) & 0xFF

    if key == ord('e'):
        writing_enabled = True
        print("[INFO] ✍️ Écriture activée")

    elif key == ord('q'):
        break

camera.release()
cv2.destroyAllWindows()
