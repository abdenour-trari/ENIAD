// src/pages/connexion.jsx
import React, { useState } from "react";
import { Lock, User, Github } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route to redirect back to after successful login
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setErrorMsg("");
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || `Échec de connexion via ${provider}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-sky-950 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-8 max-w-md w-full border border-white/20">
        <h1 className="text-3xl font-black text-center text-slate-900 tracking-tight mb-2">
          Connexion
        </h1>
        <p className="text-center text-slate-500 text-sm mb-6">
          Portail Académique & Étudiant AEI
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute top-3.5 left-3.5 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Email académique ou étudiant"
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
              placeholder="Mot de passe"
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

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs text-sky-600 hover:underline hover:text-sky-700 font-medium"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg hover:bg-sky-700 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">Ou continuer avec</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 rounded-2xl py-2.5 transition text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.578 0-6.49-2.912-6.49-6.49s2.912-6.49 6.49-6.49c1.679 0 3.15.637 4.29 1.696l3.07-3.07C19.22 2.226 15.97 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c5.732 0 10.457-3.834 11.536-9H12.24z"
              />
            </svg>
            Google
          </button>
          <button
            onClick={() => handleSocialLogin("github")}
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 rounded-2xl py-2.5 transition text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Github className="w-4 h-4 text-slate-900" />
            GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-slate-500 text-xs">
          Pas encore de compte ?{" "}
          <Link
            to="/register"
            className="text-sky-600 hover:underline font-semibold hover:text-sky-700"
          >
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}
