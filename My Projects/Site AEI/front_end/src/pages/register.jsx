// src/pages/register.jsx
import React, { useState } from "react";
import { Lock, User, Mail, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
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
      await signUp(email, password, fullName);
      setSuccessMsg(
        "Inscription réussie ! Veuillez vérifier votre boîte e-mail pour confirmer votre compte."
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-sky-950 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-8 max-w-md w-full border border-white/20">
        <h1 className="text-3xl font-black text-center text-slate-900 tracking-tight mb-2">
          Créer un compte
        </h1>
        <p className="text-center text-slate-500 text-sm mb-6">
          Rejoignez la communauté étudiante de l'AEI
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
            <User className="absolute top-3.5 left-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Nom complet (ex: Ahmed Alaoui)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-slate-200 rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="relative">
            <Mail className="absolute top-3.5 left-3.5 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Adresse e-mail académique"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-slate-200 rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-3.5 left-3.5 text-slate-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe (min. 6 caractères)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-slate-200 rounded-2xl py-3 pl-11 pr-11 focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-slate-900 bg-slate-50/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-sky-600 cursor-pointer"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
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
              "S'inscrire"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-xs">
          Déjà membre ?{" "}
          <Link
            to="/connexion"
            className="text-sky-600 hover:underline font-semibold hover:text-sky-700"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
