from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Indenter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os

def create_pdf():
    pdf_path = os.path.join(os.getcwd(), 'ai_engine_explication.pdf')
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    heading_style = styles['Heading2']
    body_style = styles['Normal']
    body_style.spaceAfter = 10
    
    components = []
    
    components.append(Paragraph("Explication du Rôle : ai_engine.py", title_style))
    components.append(Spacer(1, 0.2 * inch))
    
    intro_text = (
        "Le fichier <b>ai_engine.py</b> agit comme le moteur d'analyse IA de la plateforme Nesture AI. "
        "Son rôle principal est d'analyser les données collectées pendant qu'un enfant (l'apprenant) "
        "joue à une session de jeu, et de traduire ces données brutes en informations cliniques et en "
        "recommandations utiles pour les ergothérapeutes (OT) et les parents."
    )
    components.append(Paragraph(intro_text, body_style))
    
    components.append(Paragraph("Voici une explication détaillée de ses responsabilités principales :", body_style))
    components.append(Spacer(1, 0.1 * inch))
    
    sections = [
        (
            "1. Détection des réflexes primitifs (ReflexRule & REFLEX_RULES)",
            "Le fichier contient des règles définies pour différents réflexes primitifs (comme Moro, "
            "ATNR, STNR, TLR, Spinal Galant, Palmar Grasp). Pour chaque réflexe, il définit l'impact "
            "(ex: difficulté à croiser la ligne médiane pour l'ATNR), les indicateurs "
            "comportementaux dans le jeu, et les exercices recommandés (ex: 'ex-004')."
        ),
        (
            "2. Calcul des métriques de la session (_calculate_metrics)",
            "À la fin d'une session de jeu, ce fichier prend les données de la session et des gestes en main "
            "(nombre d'essais, prises parfaites, temps de réponse, fatigue, lissage de la trajectoire de "
            "la main, etc.) et normalise ces métriques sous forme de pourcentages ou d'indices (comme le "
            "taux d'échec ou l'avg_head_hand_coupling)."
        ),
        (
            "3. Calcul du score des réflexes (_score_reflexes)",
            "Basé sur les indicateurs détectés lors du jeu, le moteur calcule un score d'intégration "
            "de 0 à 100 pour chaque réflexe. Un score élevé (proche de 100) signifie que le réflexe "
            "est bien intégré. Un score plus bas s'applique en cas de pénalité (précision faible, "
            "temps de réponse lent, mouvement saccadé), indiquant un possible maintien anormal du réflexe. "
            "Il associe également un niveau de confiance (Élevé, Moyen, Faible)."
        ),
        (
            "4. Génération de Recommandations (_generate_recommendations)",
            "En fonction des scores de réflexes et des problèmes majeurs détectés (niveaux de "
            "confiance Élevé ou Moyen), l'algorithme génère automatiquement 3 à 5 recommandations "
            "d'exercices ciblés (ex: jeux ou exercices physiques spécifiques) pour aider l'enfant à progresser."
        ),
        (
            "5. Génération d'un résumé narratif (_generate_narrative)",
            "L'IA rédige automatiquement un petit texte résumé (en anglais dans le code) adapté "
            "aux parents et thérapeutes. Le ton du message varie selon les performances (excellent, "
            "bon ou nécessite de l'attention) et met en avant les réflexes spécifiques sur lesquels "
            "se concentrer."
        ),
        (
            "6. LPI : Indice de progression de l'apprenant (_calculate_lpi)",
            "Il calcule un score global appelé LPI (Learner Progress Index). Ce score "
            "de 0 à 100 est un mélange de la précision de l'enfant (40%), de sa vitesse (25%), "
            "de la fluidité de ses mouvements (20%) et du score moyen d'intégration de ses réflexes (15%)."
        )
    ]
    
    for title, body in sections:
        components.append(Paragraph(title, heading_style))
        components.append(Paragraph(body, body_style))
        components.append(Spacer(1, 0.05 * inch))
        
    components.append(Spacer(1, 0.2 * inch))
    
    conclusion = (
        "<b>En résumé :</b> C'est le « cerveau » qui convertit les clics et mouvements de main (gestes) du jeu en "
        "un vrai bilan neurologique modélisé. Il calcule des scores, effectue un diagnostic des réflexes "
        "non intégrés, et prescrit automatiquement des exercices adaptés. Actuellement, c'est un système "
        "« basé sur des règles » classiques, mais il est conçu pour être à terme remplacé ou aidé par un vrai "
        "modèle de Machine Learning."
    )
    components.append(Paragraph(conclusion, body_style))
    
    doc.build(components)
    print(f"PDF generated successfully at {pdf_path}")

if __name__ == "__main__":
    create_pdf()
