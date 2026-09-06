import type { Enterprise, ForumConfig, GroqConfig } from '../types';

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export const generateEmailWithGroq = async (
  enterprise: Enterprise,
  forumConfig: ForumConfig,
  groqConfig: GroqConfig
): Promise<GeneratedEmail> => {
  if (!groqConfig.apiKey || groqConfig.apiKey.trim() === '') {
    throw new Error("Clé API Groq manquante. Veuillez saisir votre clé API Groq dans la configuration.");
  }

  const boothText = forumConfig.hasBooth 
    ? "Oui, espace d'exposition disponible pour stand entreprise et entretiens de recrutement" 
    : "Rencontres et conférences";

  const senderSign = forumConfig.senderTitle 
    || (forumConfig.senderName ? `${forumConfig.senderName} - ${forumConfig.associationName}` : forumConfig.associationName);

  const prompt = `
Tu rédiges un email d'invitation au nom de : ${senderSign}.
Association : "${forumConfig.associationName}"
Établissement : "${forumConfig.schoolName}"
Ta mission est de rédiger un email d'invitation personnalisé, extrêmement professionnel, persuasif et chaleureux, adressé à un responsable d'entreprise pour participer à notre événement à venir : "${forumConfig.forumTitle}".

### INFORMATIONS DE L'ENTREPRISE CIBLE :
- Nom de l'entreprise : ${enterprise.name}
- Domaine / Secteur d'activité : ${enterprise.domain}
- Destinataire : ${enterprise.contactName} ${enterprise.contactTitle ? `(${enterprise.contactTitle})` : ''}
- Remarques particulières / Axe d'intérêt : ${enterprise.notes || 'Aucune remarque spécifique'}

### DÉTAILS DU FORUM ET DE L'ÉVÉNEMENT :
- Nom de l'événement : ${forumConfig.forumTitle}
- Date : ${forumConfig.eventDate}
- Lieu : ${forumConfig.eventLocation}
- Spécialités d'Ingénierie de notre école : ${forumConfig.engineeringSpecialties.join(', ')}
- Opportunités proposées : ${forumConfig.offersPFE ? "Projets de Fin d'Études (PFE), " : ""}${forumConfig.offersInternship ? "Stages d'application, " : ""}${forumConfig.offersJobs ? "Emplois Premier Emploi" : ""}
- Stands réservés pour les entreprises : ${boothText}
- Ton souhaité : ${forumConfig.tone}
- Consignes supplémentaires : ${forumConfig.customPromptInstructions}

### INSTRUCTIONS STRICTES DE GÉNÉRATION :
1. Adapte spécifiquement l'accroche et l'argumentaire au secteur d'activité de l'entreprise (${enterprise.domain}). Explique pourquoi le profil de nos élèves-ingénieurs (en particulier dans leur domaine) apportera une grande valeur ajoutée à leur entreprise.
2. Si le nom du responsable est connu (${enterprise.contactName}), utilise une formule de politesse adaptée.
3. Rédige un objet (Subject) percutant et clair.
4. Rédige le corps du mail (Body) avec une mise en page claire (paragraphes distincts, formules de politesse de début et de fin).
5. Termine obligatoirement et signe la fin du message avec l'intitulé suivant :
${senderSign}
6. Réponds UNIQUEMENT sous forme d'un objet JSON strict avec exactement deux clés: "subject" et "body". Ne mets aucun texte en dehors du JSON.

Format de réponse JSON requis :
{
  "subject": "Objet clair et incitatif",
  "body": "Texte complet du mail d'invitation..."
}
`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqConfig.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: groqConfig.model || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: "Tu es un assistant IA spécialisé dans la rédaction de mails professionnels pour les associations d'écoles d'ingénieurs. Tu réponds toujours en JSON valide."
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: groqConfig.temperature || 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `Erreur API Groq (${response.status})`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Réponse vide reçue de l'API Groq.");
    }

    const parsed = JSON.parse(rawContent);
    return {
      subject: parsed.subject || `Invitation - ${forumConfig.forumTitle}`,
      body: parsed.body || rawContent
    };
  } catch (error: any) {
    console.error("Erreur lors de la génération Groq:", error);
    throw new Error(error.message || "Échec de la génération avec Groq");
  }
};
