import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!form.name.trim()) {
          throw new Error("Inserisci il tuo nome");
        }
        await registerUser(form.name, form.email, form.password, form.role);
        toast.success("Registrazione completata!");
      } else {
        await loginUser(form.email, form.password);
        toast.success("Accesso effettuato!");
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      let message = "Si è verificato un errore";
      if (err.code === "auth/email-already-in-use") {
        message = "Email già registrata";
      } else if (err.code === "auth/invalid-email") {
        message = "Email non valida";
      } else if (err.code === "auth/weak-password") {
        message = "Password troppo debole (min. 6 caratteri)";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        message = "Email o password errati";
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "user", label: "Utente", description: "Scopri e usa i coupon" },
    { value: "organizer", label: "Organizzatore", description: "Gestisci i tuoi luna park" },
    { value: "rideOwner", label: "Gestore Giostre", description: "Gestisci le tue attrazioni" },
  ];

  return (
    <div className="min-h-screen bg-[#05050A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <img
            src="https://i.postimg.cc/s2MQPtHH/logo.png"
            alt="MyLunaPark"
            className="mx-auto h-16 mb-4"
          />
          <h1 className="font-unbounded text-3xl font-bold text-white">
            {isRegister ? "Registrati" : "Accedi"}
          </h1>
          <p className="text-zinc-400 mt-2">
            {isRegister
              ? "Crea il tuo account MyLunaPark"
              : "Bentornato su MyLunaPark"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-400">Nome</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Il tuo nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="register-name-input"
                  className="w-full pl-12 pr-4 py-3 bg-[#0F0F15] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:ring-1 focus:ring-[#FF2A6D] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="email@esempio.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                data-testid="login-email-input"
                className="w-full pl-12 pr-4 py-3 bg-[#0F0F15] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:ring-1 focus:ring-[#FF2A6D] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                data-testid="login-password-input"
                className="w-full pl-12 pr-4 py-3 bg-[#0F0F15] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:ring-1 focus:ring-[#FF2A6D] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Role Selection (Register only) */}
          {isRegister && (
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-zinc-400">Tipo di account</label>
              <div className="grid grid-cols-1 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    data-testid={`role-${r.value}`}
                    className={`p-4 text-left border transition-all ${
                      form.role === r.value
                        ? "border-[#FF2A6D] bg-[#FF2A6D]/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold text-white">{r.label}</p>
                    <p className="text-zinc-400 text-sm">{r.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit-btn"
            className="w-full py-4 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] hover:shadow-[0_0_15px_rgba(255,42,109,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isRegister ? "Registrati" : "Accedi"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            data-testid="toggle-auth-mode"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {isRegister ? (
              <>Hai già un account? <span className="text-[#01CDFE]">Accedi</span></>
            ) : (
              <>Non hai un account? <span className="text-[#01CDFE]">Registrati</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
