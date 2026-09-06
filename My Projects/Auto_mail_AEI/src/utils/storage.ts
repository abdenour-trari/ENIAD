import type { Enterprise, ForumConfig, GroqConfig, SmtpConfig } from '../types';

const STORAGE_KEYS = {
  ENTERPRISES: 'aei_auto_mail_enterprises',
  FORUM_CONFIG: 'aei_auto_mail_forum_config',
  GROQ_CONFIG: 'aei_auto_mail_groq_config',
  SMTP_CONFIG: 'aei_auto_mail_smtp_config',
};

export const defaultForumConfig: ForumConfig = {
  associationName: "AEI - Association des Étudiants Ingénieurs ENIAD",
  forumTitle: "Forum Entreprises & PFE 2026",
  eventDate: "15 Novembre 2026",
  eventLocation: "Campus Universitaire - Salle de Conférence",
  schoolName: "École Nationale de L'intelligence Artificielle et du digitale",
  engineeringSpecialties: [
    "Intelligence Artificielle (IA)",
    "Robotique et objets connectés (ROC)",
    "Ingénierie réseaux et sécurité informatique (IRSI)",
    "Génie Informatique (GINF)"
  ],
  offersPFE: true,
  offersInternship: true,
  offersJobs: true,
  hasBooth: true,
  tone: "dynamic",
  customPromptInstructions: "Insister sur la qualité académique de nos futurs ingénieurs et proposer une rencontre privilégiée lors du Forum.",
  senderName: "TRARI Abdenour",
  senderTitle: "Responsable de relations externes et Forum : TRARI Abdenour"
};

export const defaultGroqConfig: GroqConfig = {
  apiKey: "",
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
};

export const defaultSmtpConfig: SmtpConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  user: "",
  pass: "",
  fromName: "Responsable de relations externes et Forum : TRARI Abdenour",
  fromEmail: "",
};

export const sampleEnterprises: Enterprise[] = [
  {
    id: "sample-1",
    name: "TechNova Solutions",
    domain: "Intelligence Artificielle & Cloud",
    contactName: "Mme. Sarah Benali",
    contactTitle: "Directrice des Ressources Humaines",
    email: "sarah.benali@technova-example.com",
    notes: "Entreprise en forte croissance dans le Big Data et le Machine Learning. Cherche des profils Data Engineers et Fullstack.",
    status: "pending"
  },
  {
    id: "sample-2",
    name: "BuildCorp Engineering",
    domain: "Génie Civil & Infrastructure Durables",
    contactName: "M. Karim Mansouri",
    contactTitle: "Responsable Recrutement Talent",
    email: "k.mansouri@buildcorp-example.com",
    notes: "Spécialisé dans les grands projets d'infrastructure verte et Smart Cities.",
    status: "pending"
  },
  {
    id: "sample-3",
    name: "AutoDrive Systems",
    domain: "Automobile & Systèmes Embarqués",
    contactName: "M. Youssef El Amrani",
    contactTitle: "Lead Talent Acquisition",
    email: "y.amrani@autodrive-example.com",
    notes: "Intéressé par les stages PFE en systèmes embarqués et informatique industrielle.",
    status: "pending"
  }
];

export const loadEnterprises = (): Enterprise[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENTERPRISES);
    return data ? JSON.parse(data) : sampleEnterprises;
  } catch {
    return sampleEnterprises;
  }
};

export const saveEnterprises = (enterprises: Enterprise[]): void => {
  localStorage.setItem(STORAGE_KEYS.ENTERPRISES, JSON.stringify(enterprises));
};

export const loadForumConfig = (): ForumConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FORUM_CONFIG);
    if (!data) return defaultForumConfig;
    const parsed = JSON.parse(data);
    // Upgrade parsed config if association or school name has changed or needs update
    if (!parsed.associationName || parsed.associationName !== defaultForumConfig.associationName || parsed.schoolName !== defaultForumConfig.schoolName) {
      const merged: ForumConfig = {
        ...defaultForumConfig,
        ...parsed,
        associationName: defaultForumConfig.associationName,
        schoolName: defaultForumConfig.schoolName,
      };
      saveForumConfig(merged);
      return merged;
    }
    return parsed;
  } catch {
    return defaultForumConfig;
  }
};

export const saveForumConfig = (config: ForumConfig): void => {
  localStorage.setItem(STORAGE_KEYS.FORUM_CONFIG, JSON.stringify(config));
};

export const loadGroqConfig = (): GroqConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GROQ_CONFIG);
    return data ? JSON.parse(data) : defaultGroqConfig;
  } catch {
    return defaultGroqConfig;
  }
};

export const saveGroqConfig = (config: GroqConfig): void => {
  localStorage.setItem(STORAGE_KEYS.GROQ_CONFIG, JSON.stringify(config));
};

export const loadSmtpConfig = (): SmtpConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SMTP_CONFIG);
    return data ? JSON.parse(data) : defaultSmtpConfig;
  } catch {
    return defaultSmtpConfig;
  }
};

export const saveSmtpConfig = (config: SmtpConfig): void => {
  localStorage.setItem(STORAGE_KEYS.SMTP_CONFIG, JSON.stringify(config));
};
