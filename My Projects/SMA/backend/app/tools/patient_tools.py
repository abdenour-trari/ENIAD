QUESTIONS = [
    "Depuis quand avez-vous les symptômes ?",
    "Avez-vous de la fièvre ?",
    "Avez-vous des difficultés respiratoires ?",
    "Prenez-vous des médicaments actuellement ?",
    "Avez-vous des antécédents médicaux ?"
]


def get_question(index: int):
    if index < len(QUESTIONS):
        return QUESTIONS[index]

    return None