import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { getMyRideCoupons, getCouponUsageStats, recordCouponValidation, createRideClaim } from "../services/rideService";
import { getCouponsByPark } from "../services/couponService";
import { getAllParks } from "../services/parkService";
import { 
  LayoutDashboard, QrCode, BarChart3, Loader2, 
  CheckCircle, Ticket, Send, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function RideOwnerDashboard() {
  const { user } = useAuthContext();
  const [myCoupons, setMyCoupons] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Claim request
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [parks, setParks] = useState([]);
  const [selectedParkForClaim, setSelectedParkForClaim] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCouponForClaim, setSelectedCouponForClaim] = useState(null);

  useEffect(() => {
    loadData();
    loadParks();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const coupons = await getMyRideCoupons(user.uid);
      setMyCoupons(coupons);

      // Load stats for each coupon
      const statsMap = {};
      for (const c of coupons) {
        statsMap[c.id] = await getCouponUsageStats(c.id);
      }
      setStats(statsMap);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadParks = async () => {
    try {
      const data = await getAllParks();
      setParks(data.filter(p => p.status === "approved"));
    } catch (error) {
      console.error("Error loading parks:", error);
    }
  };

  const loadParkCoupons = async (parkId) => {
    try {
      const coupons = await getCouponsByPark(parkId);
      // Filter only unassigned coupons
      setAvailableCoupons(coupons.filter(c => !c.rideOwnerId));
    } catch (error) {
      console.error("Error loading coupons:", error);
    }
  };

  // Handle QR scan (simulated)
  const handleQRScan = async (coupon) => {
    try {
      // In real app, this would use camera/QR scanner
      const userId = prompt("Inserisci ID utente (simulazione QR):");
      if (!userId) return;

      await recordCouponValidation(coupon.id, userId);
      toast.success("Coupon validato con successo!");
      loadData();
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast.error("Errore nella validazione");
    }
  };

  // Submit claim request
  const handleClaimSubmit = async () => {
    if (!selectedParkForClaim || !selectedCouponForClaim) {
      toast.error("Seleziona un parco e un coupon");
      return;
    }

    try {
      await createRideClaim({
        parkId: selectedParkForClaim,
        couponId: selectedCouponForClaim,
        requestedBy: user.uid,
        requestedByName: user.name || user.email,
      });
      toast.success("Richiesta inviata! Attendi approvazione dall'organizzatore.");
      setShowClaimForm(false);
      setSelectedParkForClaim(null);
      setSelectedCouponForClaim(null);
      setAvailableCoupons([]);
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast.error("Errore nell'invio della richiesta");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF2A6D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050A] pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-[#0F0F15] border-b border-white/5 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-[#05D59E]" />
            <h1 className="font-unbounded text-2xl font-bold text-white">
              Le Mie Giostre
            </h1>
          </div>

          <button
            onClick={() => setShowClaimForm(true)}
            data-testid="request-ride-btn"
            className="flex items-center gap-2 px-4 py-2 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] hover:shadow-[0_0_15px_rgba(255,42,109,0.5)] transition-all"
          >
            <Send className="w-5 h-5" />
            Richiedi Giostra
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {myCoupons.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400 text-lg mb-2">Non gestisci ancora nessuna giostra</p>
            <p className="text-zinc-500 mb-6">Invia una richiesta per gestire un'attrazione</p>
            <button
              onClick={() => setShowClaimForm(true)}
              className="px-6 py-3 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] transition-all"
            >
              Richiedi una giostra
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-[#0F0F15] border border-white/5 p-6 space-y-4"
                data-testid={`ride-card-${coupon.id}`}
              >
                <div>
                  <h3 className="font-unbounded font-bold text-lg text-[#FFB800]">
                    {coupon.nomeAttrazione}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Giostra #{coupon.numeroGiostra}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 p-3 bg-[#05050A] border border-white/5">
                  <BarChart3 className="w-5 h-5 text-[#01CDFE]" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Utilizzi</p>
                    <p className="text-white text-lg font-bold">{stats[coupon.id] || 0}</p>
                  </div>
                </div>

                {/* Validation */}
                {coupon.validationType === "qr" ? (
                  <button
                    onClick={() => handleQRScan(coupon)}
                    data-testid={`qr-scan-btn-${coupon.id}`}
                    className="w-full py-3 bg-[#05D59E] text-black font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(5,213,158,0.5)] transition-all"
                  >
                    <QrCode className="w-5 h-5" />
                    Scansiona QR
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-[#05050A] border border-white/5 text-zinc-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Modalità verifica visiva
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Request Modal */}
      {showClaimForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0F15] border border-white/10 p-6 max-w-md w-full space-y-4">
            <h2 className="font-unbounded font-bold text-xl text-white">Richiedi Giostra</h2>
            
            <div className="space-y-4">
              {/* Park Selection */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400">Seleziona Luna Park</label>
                <select
                  value={selectedParkForClaim || ""}
                  onChange={(e) => {
                    setSelectedParkForClaim(e.target.value);
                    setSelectedCouponForClaim(null);
                    if (e.target.value) {
                      loadParkCoupons(e.target.value);
                    } else {
                      setAvailableCoupons([]);
                    }
                  }}
                  data-testid="select-park-for-claim"
                  className="w-full p-3 bg-[#05050A] border border-white/10 text-white focus:border-[#FF2A6D] focus:outline-none"
                >
                  <option value="">-- Seleziona --</option>
                  {parks.map((park) => (
                    <option key={park.id} value={park.id}>
                      {park.nome} - {park.citta}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coupon Selection */}
              {selectedParkForClaim && (
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-400">Seleziona Attrazione</label>
                  {availableCoupons.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Nessuna attrazione disponibile
                    </div>
                  ) : (
                    <select
                      value={selectedCouponForClaim || ""}
                      onChange={(e) => setSelectedCouponForClaim(e.target.value)}
                      data-testid="select-coupon-for-claim"
                      className="w-full p-3 bg-[#05050A] border border-white/10 text-white focus:border-[#FF2A6D] focus:outline-none"
                    >
                      <option value="">-- Seleziona --</option>
                      {availableCoupons.map((coupon) => (
                        <option key={coupon.id} value={coupon.id}>
                          {coupon.nomeAttrazione} (#{coupon.numeroGiostra})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowClaimForm(false);
                  setSelectedParkForClaim(null);
                  setSelectedCouponForClaim(null);
                  setAvailableCoupons([]);
                }}
                className="flex-1 py-3 border border-white/20 text-white hover:bg-white/5 transition-all"
              >
                Annulla
              </button>
              <button
                onClick={handleClaimSubmit}
                disabled={!selectedParkForClaim || !selectedCouponForClaim}
                data-testid="submit-claim-btn"
                className="flex-1 py-3 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Invia Richiesta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
