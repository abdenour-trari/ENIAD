export const COLORS = {
  // Vert Principal (Jiblina Green)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a', // Primary Green
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    DEFAULT: '#16a34a',
  },
  // Orange Secondaire (Jiblina Orange)
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Secondary Orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    DEFAULT: '#f97316',
  },
  // Fond Blanc Cassé (Off-White Background) & Neutrals
  background: {
    offWhite: '#faf9f6', // Main Blanc Cassé
    surface: '#ffffff',  // Surface Card White
    subtle: '#f3f4f6',   // Subtle Gray
    DEFAULT: '#faf9f6',
  },
  text: {
    primary: '#111827',   // Dark Gray / Near Black
    secondary: '#4b5563', // Slate Gray
    muted: '#9ca3af',     // Muted Gray
    light: '#ffffff',     // White
  },
  border: {
    light: '#e5e7eb',
    default: '#d1d5db',
    dark: '#9ca3af',
  },
  status: {
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export type ColorsType = typeof COLORS;
