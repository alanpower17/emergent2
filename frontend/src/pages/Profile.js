import { useAuthContext } from "../context/AuthContext";
import { signOut } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout effettuato");
    navigate("/");
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: "Amministratore", color: "bg-[#FF2A6D]" },
      organizer: { label: "Organizzatore", color: "bg-[#01CDFE]" },
      rideOwner: { label: "Gestore Giostre", color: "bg-[#05D59E]" },
      user: { label: "Utente", color: "bg-zinc-600" },
    };
    return badges[role] || badges.user;
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <div className="min-h-screen bg-[#05050A] pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-[#0F0F15] border-b border-white/5 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF2A6D] to-[#01CDFE] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-unbounded text-2xl font-bold text-white">
                {user?.name || "Utente"}
              </h1>
              <span className={`inline-block mt-1 px-3 py-1 text-xs font-bold text-white rounded-full ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Info Card */}
        <div className="bg-[#0F0F15] border border-white/5 p-6 space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#01CDFE]" />
            Informazioni Account
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#05050A] border border-white/5">
              <Mail className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#05050A] border border-white/5">
              <Shield className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Ruolo</p>
                <p className="text-white">{roleBadge.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          data-testid="profile-logout-btn"
          className="w-full py-4 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Esci dall'account
        </button>
      </div>
    </div>
  );
}
