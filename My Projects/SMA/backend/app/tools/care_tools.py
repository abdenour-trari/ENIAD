def generate_basic_recommendation(symptoms: str):

    symptoms = symptoms.lower()

    if "toux" in symptoms:
        return "Hydratation, repos et surveillance."

    if "fièvre" in symptoms:
        return "Repos, hydratation et surveillance de la température."

    if "douleur" in symptoms:
        return "Repos et consultation si aggravation."

    return "Surveillance générale recommandée."