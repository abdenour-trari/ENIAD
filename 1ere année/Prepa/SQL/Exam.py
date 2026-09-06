import json

# Charger les questions depuis le fichier JSON
with open("QCM_IBD_Examen.json", "r") as file:
    questions = json.load(file)

# Parcourir et afficher les questions
for index, question in enumerate(questions, start=1):
    print(f"Question {index}: {question['question']}")
    for i, option in enumerate(question['options']):
        print(f"  {chr(65 + i)}. {option}")
    print("\n")
