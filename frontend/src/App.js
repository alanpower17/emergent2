import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import ParkDetail from "./pages/ParkDetail";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import RideOwnerDashboard from "./pages/RideOwnerDashboard";
import AdminPanel from "./pages/AdminPanel";
import AdminSponsorStats from "./pages/AdminSponsorStats";

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-[#05050A]">
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/park/:id" element={<ParkDetail />} />

            {/* Protected User Routes */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Organizer Dashboard */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute role="organizer">
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Ride Owner Dashboard */}
            <Route
              path="/ride-owner"
              element={
                <ProtectedRoute role="rideOwner">
                  <RideOwnerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stats"
              element={
                <ProtectedRoute role="admin">
                  <AdminSponsorStats />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#0F0F15',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
