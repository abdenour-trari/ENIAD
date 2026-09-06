// src/pages/reset-password.jsx
import React, { useState } from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccessMsg("Votre mot de passe a été réinitialisé avec succès !");
      setTimeout(() => {
        navigate("/connexion");
      }, 3000);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-sky-950 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-8 max-w-md w-full border border-white/20">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Nouveau mot de passe
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Saisissez votre nouveau mot de passe ci-dessous.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-xl font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-xs rounded-r-xl font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute top-3.5 left-3.5 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-slate-200 rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-3.5 left-3.5 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-slate-200 rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-slate-900 bg-slate-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg hover:bg-sky-700 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Enregistrer le mot de passe"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
