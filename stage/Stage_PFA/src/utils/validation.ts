import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'L\'adresse e-mail est requise' })
    .min(1, 'L\'adresse e-mail est requise')
    .email('Adresse e-mail invalide'),
  password: z
    .string({ required_error: 'Le mot de passe est requis' })
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Le nom complet est requis' })
      .min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z
      .string({ required_error: 'L\'adresse e-mail est requise' })
      .min(1, 'L\'adresse e-mail est requise')
      .email('Adresse e-mail invalide'),
    university: z
      .string({ required_error: 'Veuillez sélectionner votre université / école' })
      .min(1, 'Veuillez sélectionner votre université / école'),
    phone: z
      .string({ required_error: 'Le numéro de téléphone est requis' })
      .min(8, 'Numéro de téléphone invalide'),
    password: z
      .string({ required_error: 'Le mot de passe est requis' })
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z
      .string({ required_error: 'Veuillez confirmer le mot de passe' })
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Vous devez accepter les conditions d\'utilisation',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
