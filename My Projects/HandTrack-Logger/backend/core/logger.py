import csv
import os
import time

class CSVLogger:
    def __init__(self, file_path):
        self.file_path = file_path

        if not os.path.exists(file_path):
            with open(file_path, mode='w', newline='') as f:
                writer = csv.writer(f)
                header = ['Timestamp', 'KeyPressed'] + [
                    f'LM_{i}_{axis}' for i in range(21) for axis in ('x','y','z')
                ]
                writer.writerow(header)

    def log(self, hand_landmarks, key_pressed):
        row = [time.time(), key_pressed]

        for lm in hand_landmarks:
            row.extend([lm.x, lm.y, lm.z])

        with open(self.file_path, mode='a', newline='') as f:
            csv.writer(f).writerow(row)