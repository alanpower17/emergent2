import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, role, allowedRoles }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF2A6D] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check single role
  if (role && user.role !== role) {
    return (
      <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold text-[#FF2A6D] mb-2">Accesso Negato</h1>
        <p className="text-zinc-400">Non hai i permessi per accedere a questa pagina.</p>
      </div>
    );
  }

  // Check multiple roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold text-[#FF2A6D] mb-2">Accesso Negato</h1>
        <p className="text-zinc-400">Non hai i permessi per accedere a questa pagina.</p>
      </div>
    );
  }

  return children;
}
