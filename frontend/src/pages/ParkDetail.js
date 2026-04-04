import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getParkById } from "../services/parkService";
import { getCouponsByPark, recordCouponUse, getUserCouponUses } from "../services/couponService";
import { useAuthContext } from "../context/AuthContext";
import CouponCard from "../components/CouponCard";
import RedeemModal from "../components/RedeemModal";
import { MapPin, Clock, Ticket, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ParkDetail() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [park, setPark] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [usedCoupons, setUsedCoupons] = useState({});
  const [imgError, setImgError] = useState(false);

  const defaultImage = "https://images.pexels.com/photos/1336429/pexels-photo-1336429.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

  // Load park and coupons
  useEffect(() => {
    const loadData = async () => {
      try {
        const [parkData, couponsData] = await Promise.all([
          getParkById(id),
          getCouponsByPark(id),
        ]);
        setPark(parkData);
        setCoupons(couponsData);

        // Load user's coupon uses
        if (user) {
          const uses = await getUserCouponUses(user.uid);
          const usesMap = {};
          uses.forEach((u) => {
            usesMap[u.couponId] = u.usedAt;
          });
          setUsedCoupons(usesMap);
        }
      } catch (error) {
        console.error("Error loading park:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, user]);

  // Confirm coupon use
  const confirmUse = async () => {
    if (!selectedCoupon || !user) {
      toast.error("Devi accedere per usare i coupon");
      return;
    }

    try {
      await recordCouponUse(user.uid, selectedCoupon.id, id);
      setUsedCoupons((prev) => ({
        ...prev,
        [selectedCoupon.id]: Date.now(),
      }));
      toast.success("Coupon utilizzato! Mostralo alla cassa.");
      setSelectedCoupon(null);
    } catch (error) {
      console.error("Error using coupon:", error);
      toast.error("Errore nell'utilizzo del coupon");
    }
  };

  // Calculate cooldown
  const getCooldownInfo = (couponId) => {
    const lastUsed = usedCoupons[couponId];
    if (!lastUsed) return { disabled: false, remaining: null };

    const cooldown = 24 * 60 * 60 * 1000; // 24 hours
    const elapsed = Date.now() - lastUsed;
    const remaining = cooldown - elapsed;

    if (remaining <= 0) return { disabled: false, remaining: null };

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return {
      disabled: true,
      remaining: `${hours}h ${minutes}m`,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF2A6D] animate-spin" />
      </div>
    );
  }

  if (!park) {
    return (
      <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Luna Park non trovato</h1>
        <Link to="/" className="text-[#01CDFE] hover:underline">
          Torna alla home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050A] pb-24 md:pb-8">
      {/* Hero */}
      <div className="relative h-64 md:h-80">
        <img
          src={imgError ? defaultImage : (park.image || defaultImage)}
          onError={() => setImgError(true)}
          alt={park.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/50 to-transparent" />
        
        {/* Back button */}
        <Link
          to="/"
          data-testid="back-btn"
          className="absolute top-4 left-4 p-3 bg-black/50 backdrop-blur text-white hover:bg-black/70 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Park Info */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        <div className="bg-[#0F0F15] border border-white/5 p-6 space-y-4">
          <h1 
            className="font-unbounded text-3xl md:text-4xl font-bold text-white"
            data-testid="park-name"
          >
            {park.nome}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-zinc-400">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {park.citta || "Italia"}
            </span>
            {park.orari && (
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {park.orari}
              </span>
            )}
          </div>

          {park.descrizione && (
            <p className="text-zinc-400">{park.descrizione}</p>
          )}
        </div>
      </div>

      {/* Coupons Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Ticket className="w-6 h-6 text-[#FFB800]" />
          <h2 className="font-unbounded text-2xl font-bold text-white">
            Coupon Disponibili
          </h2>
          <span className="px-3 py-1 bg-[#FFB800] text-black text-sm font-bold rounded-full">
            {coupons.length}
          </span>
        </div>

        {coupons.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nessun coupon disponibile al momento</p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            data-testid="coupons-grid"
          >
            {coupons.map((coupon) => {
              const { disabled, remaining } = getCooldownInfo(coupon.id);
              return (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  parkId={id}
                  disabled={disabled}
                  remaining={remaining}
                  onUse={() => {
                    if (!user) {
                      toast.error("Devi accedere per usare i coupon");
                      return;
                    }
                    setSelectedCoupon(coupon);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Redeem Modal */}
      <RedeemModal
        coupon={selectedCoupon}
        onConfirm={confirmUse}
        onClose={() => setSelectedCoupon(null)}
      />
    </div>
  );
}
