import type { Enterprise, SmtpConfig } from '../types';

export interface SendEmailResult {
  success: boolean;
  message: string;
}

export const sendEmailViaSmtp = async (
  enterprise: Enterprise,
  smtpConfig: SmtpConfig
): Promise<SendEmailResult> => {
  if (!enterprise.generatedSubject || !enterprise.generatedBody) {
    return {
      success: false,
      message: "Le message pour cette entreprise n'a pas encore été généré par l'IA."
    };
  }

  try {
    const response = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: enterprise.email,
        subject: enterprise.generatedSubject,
        body: enterprise.generatedBody,
        smtp: smtpConfig,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || `Erreur serveur d'envoi (${response.status})`
      };
    }

    return {
      success: true,
      message: "Email envoyé avec succès !"
    };
  } catch (error: any) {
    console.error("Erreur d'envoi SMTP:", error);
    return {
      success: false,
      message: error.message || "Impossible de contacter le serveur d'envoi SMTP. Assurez-vous que le serveur local est actif."
    };
  }
};

export const openMailClient = (enterprise: Enterprise): void => {
  if (!enterprise.email) return;
  const subject = encodeURIComponent(enterprise.generatedSubject || `Invitation Forum Entreprises`);
  const body = encodeURIComponent(enterprise.generatedBody || '');
  window.open(`mailto:${enterprise.email}?subject=${subject}&body=${body}`, '_blank');
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
