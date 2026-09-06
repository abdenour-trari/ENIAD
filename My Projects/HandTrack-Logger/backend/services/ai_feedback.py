import random

def generate_ai_feedback(motor_data):

    stability = int(motor_data["stability"].replace("%", ""))
    precision = int(motor_data["precision"].replace("%", ""))
    select = int(motor_data["select"].replace("%", ""))
    accuracy = int(motor_data["accuracy"].replace("%", ""))
    response_time = float(motor_data["response_time"].replace("s", ""))

    feedback = ""
    encouragement = ""

    # motor analysis
    if precision > 85:
        feedback = "Excellent hand precision and fine motor control."
    elif precision > 60:
        feedback = "Good precision, try to stabilize your hand."
    else:
        feedback = "Low precision detected, slow down your movement."

    # stability
    if stability > 85:
        encouragement = "Fantastic job! Your hand stability is very strong."
    elif stability > 60:
        encouragement = "Good progress, keep practicing."
    else:
        encouragement = "Practice steady hand movement."

    # speed
    if response_time < 2:
        encouragement += " Fast response detected."
    else:
        encouragement += " Try to respond faster."

    # accuracy
    if accuracy > 85:
        encouragement += " Communication skills improving well."

    return {
        "feedback": feedback,
        "encouragement": encouragement
    }