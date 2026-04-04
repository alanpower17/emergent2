import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { signOut } from "../services/authService";
import { Home, Heart, User, Settings, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case "admin":
        return { path: "/admin", label: "Admin" };
      case "organizer":
        return { path: "/organizer", label: "Dashboard" };
      case "rideOwner":
        return { path: "/ride-owner", label: "Le Mie Giostre" };
      default:
        return null;
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#0F0F15]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto w-full px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="navbar-logo">
            <img 
              src="https://i.postimg.cc/s2MQPtHH/logo.png" 
              alt="MyLunaPark" 
              className="h-10"
            />
            <span className="font-unbounded font-bold text-xl text-white">MyLunaPark</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              data-testid="nav-home"
              className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
                isActive("/") 
                  ? "text-[#FF2A6D]" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            {user && (
              <Link
                to="/favorites"
                data-testid="nav-favorites"
                className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
                  isActive("/favorites") 
                    ? "text-[#FF2A6D]" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Heart className="w-5 h-5" />
                <span>Preferiti</span>
              </Link>
            )}

            {dashboardLink && (
              <Link
                to={dashboardLink.path}
                data-testid="nav-dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
                  isActive(dashboardLink.path) 
                    ? "text-[#FF2A6D]" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>{dashboardLink.label}</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-zinc-400 text-sm">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  data-testid="nav-logout"
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF2A6D] text-white rounded hover:bg-[#FF528A] hover:shadow-[0_0_15px_rgba(255,42,109,0.5)] transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Esci
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                data-testid="nav-login"
                className="flex items-center gap-2 px-4 py-2 bg-[#FF2A6D] text-white rounded hover:bg-[#FF528A] hover:shadow-[0_0_15px_rgba(255,42,109,0.5)] transition-all"
              >
                <User className="w-4 h-4" />
                Accedi
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F0F15]/90 backdrop-blur-xl border-t border-white/5 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          <Link
            to="/"
            data-testid="mobile-nav-home"
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              isActive("/") ? "text-[#FF2A6D]" : "text-zinc-400"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>

          {user && (
            <Link
              to="/favorites"
              data-testid="mobile-nav-favorites"
              className={`flex flex-col items-center gap-1 px-4 py-2 ${
                isActive("/favorites") ? "text-[#FF2A6D]" : "text-zinc-400"
              }`}
            >
              <Heart className="w-6 h-6" />
              <span className="text-xs">Preferiti</span>
            </Link>
          )}

          {dashboardLink && (
            <Link
              to={dashboardLink.path}
              data-testid="mobile-nav-dashboard"
              className={`flex flex-col items-center gap-1 px-4 py-2 ${
                isActive(dashboardLink.path) ? "text-[#FF2A6D]" : "text-zinc-400"
              }`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-xs">{dashboardLink.label}</span>
            </Link>
          )}

          <Link
            to={user ? "/profile" : "/login"}
            data-testid="mobile-nav-profile"
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              isActive("/profile") || isActive("/login") ? "text-[#FF2A6D]" : "text-zinc-400"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">{user ? "Profilo" : "Accedi"}</span>
          </Link>
        </div>
      </nav>

      {/* Spacers */}
      <div className="hidden md:block h-16" />
      <div className="md:hidden h-0" />
    </>
  );
}
