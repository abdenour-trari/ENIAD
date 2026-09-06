export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  avatarColor: string;
}

const AUTHORIZED_USERS = [
  {
    id: 'user-1',
    name: 'TRARI Abdenour',
    email: 'abdenourtrari@aei.com',
    password: 'abdou123@trari',
    role: 'Responsable de relations externes et Forum',
    title: 'Responsable de relations externes et Forum : TRARI Abdenour',
    avatarColor: 'from-brand-500 to-amber-400'
  },
  {
    id: 'user-2',
    name: 'Mohamed SAIDI',
    email: 'mohamedsaidi@aei.com',
    password: 'mohamed123@saidi',
    role: 'Président de l\'association',
    title: 'Président de l\'association Mohamed SAIDI',
    avatarColor: 'from-emerald-500 to-brand-500'
  }
];

const SESSION_KEY = 'aei_auth_current_user_session';

export const loginUser = (emailInput: string, passwordInput: string): User => {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  const foundUser = AUTHORIZED_USERS.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
  );

  if (!foundUser) {
    throw new Error('Identifiants incorrects. Vérifiez votre adresse email et votre mot de passe.');
  }

  const sessionUser: User = {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    role: foundUser.role,
    title: foundUser.title,
    avatarColor: foundUser.avatarColor
  };

  // Store in sessionStorage so it automatically expires when the tab/browser is closed!
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const getCurrentUser = (): User | null => {
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const logoutUser = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};
