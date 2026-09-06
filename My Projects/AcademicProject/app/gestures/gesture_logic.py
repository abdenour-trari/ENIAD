class GestureLogic:
    DRAW = "DRAW"
    ERASE = "ERASE"
    MOVE = "MOVE"

    @staticmethod
    def from_label(label):
        if label == "A":      # geste écriture
            return GestureLogic.DRAW
        elif label == "B":    # geste suppression
            return GestureLogic.ERASE
        else:
            return GestureLogic.MOVE
