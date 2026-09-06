from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 15)
        self.cell(0, 10, "Explication du Role : ai_engine.py", border=False, ln=True, align="C")
        self.ln(10)
        
    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", border=False, align="C")
        
def create_pdf():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("helvetica", size=11)
    
    # Introduction
    intro_lines = [
        "Le fichier ai_engine.py agit comme le moteur d'analyse IA de la plateforme Nesture AI.",
        "Son role principal est d'analyser les donnees collectees pendant qu'un enfant (l'apprenant) joue a",
        "une session de jeu, et de traduire ces donnees brutes en informations cliniques et en recommandations",
        "utiles pour les ergotherapeutes (OT) et les parents.",
        "",
        "Voici une explication detaillee de ses responsabilites principales :"
    ]
    for line in intro_lines:
        pdf.multi_cell(0, 6, text=line)
        
    pdf.ln(5)
    
    sections = [
        (
            "1. Detection des reflexes primitifs (ReflexRule & REFLEX_RULES)",
            "Le fichier contient des regles definies pour differents reflexes primitifs (comme Moro, "
            "ATNR, STNR, TLR, Spinal Galant, Palmar Grasp). Pour chaque reflexe, il definit l'impact "
            "(ex: difficulte a croiser la ligne mediane pour l'ATNR), les indicateurs "
            "comportementaux dans le jeu, et les exercices recommandes."
        ),
        (
            "2. Calcul des metriques de la session (_calculate_metrics)",
            "A la fin d'une session de jeu, ce fichier prend les donnees de la session et des gestes en main "
            "(nombre d'essais, prises parfaites, temps de reponse, fatigue, lissage de la trajectoire de "
            "la main, etc.) et normalise ces metriques sous forme de pourcentages ou d'indices."
        ),
        (
            "3. Calcul du score des reflexes (_score_reflexes)",
            "Base sur les indicateurs detectes lors du jeu, le moteur calcule un score d'integration "
            "de 0 a 100 pour chaque reflexe : un score eleve (proche de 100) signifie que le reflexe "
            "est bien integre. Un score plus bas s'applique en cas de penalite (precision faible, "
            "temps de reponse lent), indiquant un possible maintien anormal du reflexe. Il associe "
            "egalement un niveau de confiance."
        ),
        (
            "4. Generation de Recommandations (_generate_recommendations)",
            "En fonction des scores de reflexes et des problemes majeurs detectes, l'algorithme "
            "genere automatiquement 3 a 5 recommandations d'exercices cibles (ex: jeux ou exercices "
            "physiques specifiques) pour aider l'enfant a progresser."
        ),
        (
            "5. Generation d'un resume narratif (_generate_narrative)",
            "L'IA redige automatiquement un petit texte resume adapte aux parents et therapeutes. "
            "Le ton du message varie selon les performances de la session et met en avant les "
            "reflexes specifiques sur lesquels la therapie devra se concentrer."
        ),
        (
            "6. LPI : Indice de progression de l'apprenant (_calculate_lpi)",
            "Le systeme calcule un score global appele LPI (Learner Progress Index). Ce score "
            "de 0 a 100 est un melange de la precision de l'enfant (40%), sa vitesse (25%), "
            "la fluidite de ses mouvements (20%) et le score moyen d'integration de ses reflexes (15%)."
        )
    ]
    
    for title, body in sections:
        pdf.set_font("helvetica", "B", 12)
        pdf.multi_cell(0, 8, text=title)
        pdf.set_font("helvetica", "", 11)
        pdf.multi_cell(0, 6, text=body)
        pdf.ln(4)
        
    pdf.ln(5)
    pdf.set_font("helvetica", "B", 11)
    conclusion = (
        "En resume : C'est le veritable 'cerveau' de l'application qui convertit de "
        "simples clics et mouvements de main en un bilan neurologique structure. "
        "Il calcule des scores, effectue un diagnostic des reflexes non integres, et "
        "prescrit automatiquement des exercices adaptes."
    )
    pdf.multi_cell(0, 6, text=conclusion)
    
    pdf_path = os.path.join(os.getcwd(), 'ai_engine_explication.pdf')
    pdf.output(pdf_path)
    print(f"PDF generated at: {pdf_path}")

create_pdf()
