import streamlit as st
import requests

st.set_page_config(
    page_title="SMA Orientation Clinique",
    page_icon="🏥",
    layout="wide"
)

API_URL = "http://127.0.0.1:8000"

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
    }
    
    .main-title {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #00C6FF, #0072FF);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 2rem;
    }
    
    .card {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .agent-tag {
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 0.5rem;
    }
    
    .tag-supervisor { background-color: #7B2CBF; color: white; }
    .tag-diagnostic { background-color: #0072FF; color: white; }
    .tag-physician { background-color: #FF5E62; color: white; }
    .tag-report { background-color: #2EC4B6; color: white; }
    
    .ethical-warning {
        background-color: rgba(255, 94, 98, 0.1);
        border-left: 5px solid #FF5E62;
        padding: 1rem;
        border-radius: 0 8px 8px 0;
        margin-top: 1.5rem;
        font-style: italic;
        color: #FF8F94;
    }
    
    .success-card {
        background-color: rgba(46, 196, 182, 0.1);
        border-left: 5px solid #2EC4B6;
        padding: 1rem;
        border-radius: 0 8px 8px 0;
        margin-top: 1.5rem;
    }
</style>
""", unsafe_allow_html=True)

if "thread_id" not in st.session_state:
    st.session_state.thread_id = None
if "current_question" not in st.session_state:
    st.session_state.current_question = None

with st.sidebar:
    st.image("https://img.icons8.com/color/96/medical-doctor.png", width=80)
    st.title("Moniteur SMA")
    st.markdown("---")
    
    if st.session_state.thread_id is not None:
        if st.button("🔄 Nouvelle Consultation", use_container_width=True):
            st.session_state.thread_id = None
            st.session_state.current_question = None
            st.rerun()

    st.markdown("### 📊 État du Workflow")
    
    if st.session_state.thread_id is None:
        st.markdown("🟢 **1. Saisie Patient**")
        st.markdown("⚪ 2. Entretien Clinique")
        st.markdown("⚪ 3. Synthèse & Recommandation")
        st.markdown("⚪ 4. Validation Médecin (HITL)")
        st.markdown("⚪ 5. Rapport Final")
    else:
        try:
            res = requests.get(f"{API_URL}/consultation/{st.session_state.thread_id}")
            if res.status_code == 200:
                data = res.json()
                answers = data.get("answers", [])
                summary = data.get("preliminary_summary", "")
                feedback = data.get("physician_feedback", "")
                report = data.get("final_report", "")
                
                st.markdown("✅ **1. Saisie Patient**")
                
                if len(answers) < 5:
                    st.markdown(f"🔵 **2. Entretien Clinique ({len(answers)}/5)**")
                    st.markdown("⚪ 3. Synthèse & Recommandation")
                    st.markdown("⚪ 4. Validation Médecin (HITL)")
                    st.markdown("⚪ 5. Rapport Final")
                else:
                    st.markdown("✅ **2. Entretien Clinique (5/5)**")
                    
                    if not summary:
                        st.markdown("🔵 **3. Génération Synthèse...**")
                        st.markdown("⚪ 4. Validation Médecin (HITL)")
                        st.markdown("⚪ 5. Rapport Final")
                    else:
                        st.markdown("✅ **3. Synthèse & Recommandation**")
                        
                        if not feedback:
                            st.markdown("🔵 **4. Validation Médecin (HITL)**")
                            st.markdown("⚪ 5. Rapport Final")
                        else:
                            st.markdown("✅ **4. Validation Médecin (HITL)**")
                            if not report:
                                st.markdown("🔵 **5. Génération Rapport...**")
                            else:
                                st.markdown("✅ **5. Rapport Final Prêt**")
            else:
                st.error("Erreur de connexion au serveur.")
        except Exception:
            st.warning("Impossible de synchroniser l'état du workflow.")

st.markdown('<div class="main-title">🏥 Orientation Clinique Multi-Agents</div>', unsafe_allow_html=True)

if st.session_state.thread_id is None:
    st.subheader("📋 Saisie des informations du Patient")
    st.markdown("Veuillez renseigner les informations préliminaires ci-dessous pour démarrer le workflow d'orientation clinique.")
    
    col1, col2 = st.columns(2)
    with col1:
        patient_name = st.text_input("Nom complet", placeholder="Ex: Jean Dupont")
        age = st.number_input("Âge", min_value=1, max_value=120, value=30)
    with col2:
        symptoms = st.text_area("Symptômes principaux", placeholder="Décrivez succinctement ce que ressent le patient (ex: fièvre, toux sèche, fatigue...)")
        
    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🚀 Démarrer la Consultation", type="primary", use_container_width=True):
        if not patient_name or not symptoms:
            st.error("Veuillez remplir tous les champs avant de démarrer.")
        else:
            try:
                response = requests.post(
                    f"{API_URL}/consultation/start",
                    json={
                        "patient_name": patient_name,
                        "age": int(age),
                        "symptoms": symptoms
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "error" in data:
                        st.error(f"Erreur : {data['error']}")
                    else:
                        st.session_state.thread_id = data["thread_id"]
                        st.session_state.current_question = data["question"]
                        st.rerun()
                else:
                    st.error(f"Erreur serveur ({response.status_code}) : {response.text}")
            except Exception as e:
                st.error(f"Erreur de connexion : {str(e)}")

else:
    try:
        response = requests.get(f"{API_URL}/consultation/{st.session_state.thread_id}")
        if response.status_code == 200:
            state = response.json()
            questions = state.get("questions", [])
            answers = state.get("answers", [])
            summary = state.get("preliminary_summary", "")
            recommendation = state.get("intermediate_recommendation", "")
            feedback = state.get("physician_feedback", "")
            report = state.get("final_report", "")
            
            if len(answers) < 5:
                st.subheader("💬 Entretien Clinique en cours")
                st.info("Le Diagnostic Agent vous pose quelques questions pour affiner l'analyse. Veuillez y répondre de manière précise.")
                
                chat_container = st.container()
                with chat_container:
                    for i in range(len(answers)):
                        if i < len(questions):
                            with st.chat_message("assistant", avatar="🩺"):
                                st.markdown(f"**Diagnostic Agent** : {questions[i]}")
                            with st.chat_message("user", avatar="👤"):
                                st.markdown(f"**Patient** : {answers[i]}")
                    
                    if len(questions) > len(answers):
                        active_question = questions[-1]
                    else:
                        active_question = st.session_state.current_question
                    
                    if active_question:
                        with st.chat_message("assistant", avatar="🩺"):
                            st.markdown(f"**Diagnostic Agent** : {active_question}")
                
                answer_input = st.chat_input("Votre réponse...")
                if answer_input:
                    try:
                        ans_res = requests.post(
                            f"{API_URL}/consultation/{st.session_state.thread_id}/answer",
                            json={"answer": answer_input}
                        )
                        if ans_res.status_code == 200:
                            ans_data = ans_res.json()
                            if "next_question" in ans_data:
                                st.session_state.current_question = ans_data["next_question"]
                            st.rerun()
                        else:
                            st.error(f"Erreur d'envoi de la réponse : {ans_res.text}")
                    except Exception as e:
                        st.error(f"Erreur : {str(e)}")
            
            else:
                if not report:
                    st.subheader("👨‍⚕️ Espace de Validation Médicale (Human-in-the-Loop)")
                    st.warning("L'entretien patient est terminé. Veuillez réviser les éléments préliminaires ci-dessous et apporter vos indications.")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        st.markdown('<div class="card"><span class="agent-tag tag-diagnostic">Diagnostic Agent</span>'
                                    f'<h4>Synthèse Clinique Préliminaire</h4>'
                                    f'<p style="white-space: pre-wrap;">{summary}</p></div>', unsafe_allow_html=True)
                    with col2:
                        st.markdown('<div class="card"><span class="agent-tag tag-report">MCP Service</span>'
                                    f'<h4>Recommandation Intermédiaire</h4>'
                                    f'<p style="white-space: pre-wrap;">{recommendation}</p></div>', unsafe_allow_html=True)
                    
                    st.markdown("### 📝 Validation & Prescription")
                    physician_feedback = st.text_area(
                        "Renseignez le traitement recommandé, la conduite à tenir ou vos remarques pour le rapport final",
                        placeholder="Ex: Confirme l'hydratation et le repos. Repos de 3 jours prescrit. Reprendre paracétamol 1g en cas de fièvre > 38.5°C...",
                        height=120
                    )
                    
                    if st.button("💾 Valider et Générer le Rapport", type="primary", use_container_width=True):
                        if not physician_feedback:
                            st.error("Veuillez renseigner vos remarques ou prescriptions cliniques avant de valider.")
                        else:
                            try:
                                with st.spinner("Génération du rapport final par le Report Agent..."):
                                    phy_res = requests.post(
                                        f"{API_URL}/consultation/{st.session_state.thread_id}/physician",
                                        json={"feedback": physician_feedback}
                                    )
                                    if phy_res.status_code == 200:
                                        st.success("Validation réussie et rapport final généré.")
                                        st.rerun()
                                    else:
                                        st.error(f"Erreur : {phy_res.text}")
                            except Exception as e:
                                st.error(f"Erreur : {str(e)}")
                
                else:
                    st.subheader("📄 Rapport Clinique Finalisé")
                    
                    st.markdown(f'<div class="card"><span class="agent-tag tag-supervisor">Supervisor</span>'
                                f'<h3>Rapport d\'Orientation</h3>'
                                f'<div style="background-color: rgba(0, 0, 0, 0.2); padding: 1.5rem; border-radius: 8px;">'
                                f'{report}'
                                f'</div></div>', unsafe_allow_html=True)
                    
                    st.markdown("""
                    <div class="ethical-warning">
                        ⚠️ <strong>Rappel déontologique</strong> : Ce système est un prototype de démonstration multi-agents universitaire et ne constitue en aucun cas un dispositif médical homologué ni un avis de diagnostic définitif.
                    </div>
                    """, unsafe_allow_html=True)
                    
                    st.download_button(
                        label="📥 Télécharger le Rapport Médical (Markdown)",
                        data=report,
                        file_name=f"rapport_orientation_{st.session_state.thread_id}.md",
                        mime="text/markdown",
                        use_container_width=True
                    )
                    
        else:
            st.error("Impossible de récupérer la consultation depuis l'API backend.")
    except Exception as e:
        st.error(f"Erreur de connexion à l'API : {str(e)}")
