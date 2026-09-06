export interface Enterprise {
  id: string;
  name: string;
  domain: string;
  contactName: string;
  contactTitle?: string;
  email: string;
  notes?: string;
  status: 'pending' | 'generating' | 'generated' | 'sending' | 'sent' | 'error';
  generatedSubject?: string;
  generatedBody?: string;
  sentAt?: string;
  errorMessage?: string;
}

export interface ForumConfig {
  associationName: string;
  forumTitle: string;
  eventDate: string;
  eventLocation: string;
  schoolName: string;
  engineeringSpecialties: string[];
  offersPFE: boolean;
  offersInternship: boolean;
  offersJobs: boolean;
  hasBooth: boolean;
  tone: 'formal' | 'dynamic' | 'persuasive' | 'direct';
  customPromptInstructions: string;
  senderName?: string;
  senderTitle?: string;
}

export interface GroqConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export interface GenerationStats {
  total: number;
  generated: number;
  sent: number;
  errors: number;
}
