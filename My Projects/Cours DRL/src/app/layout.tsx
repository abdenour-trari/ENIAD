import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeepRL Académique | Plateforme d'Apprentissage Premium",
  description: "Maîtrisez le Deep Reinforcement Learning (Deep RL) de manière progressive, visuelle et intuitive. Formations, simulations interactives et codes PyTorch.",
  openGraph: {
    title: "DeepRL Académique | Plateforme Premium IA",
    description: "Enseignement interactif et moderne de l'apprentissage par renforcement profond.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="flex flex-col md:flex-row min-h-screen bg-[#030014] text-gray-100 overflow-x-hidden">
        {/* Responsive Sidebar component */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 w-full min-h-screen pt-16 md:pt-0 overflow-y-auto relative">
          {children}
        </main>
      </body>
    </html>
  );
}
