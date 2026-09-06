// src/pages/forgot-password.jsx
import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccessMsg(
        "Un e-mail de réinitialisation a été envoyé ! Veuillez vérifier votre boîte de réception."
      );
      setEmail("");
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
        <div className="mb-4">
          <Link
            to="/connexion"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-600 transition font-semibold"
          >
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Mot de passe oublié
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Saisissez votre e-mail pour recevoir un lien de réinitialisation.
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
            <Mail className="absolute top-3.5 left-3.5 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Votre e-mail académique"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              "Envoyer le lien"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
