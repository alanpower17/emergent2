import { useEffect, useState } from "react";
import { getSponsorForTarget, trackEvent } from "../services/sponsorService";
import { Ticket, Clock, ExternalLink } from "lucide-react";

export default function CouponCard({ coupon, onUse, disabled, remaining, parkId }) {
  const [sponsor, setSponsor] = useState(null);
  const [imgError, setImgError] = useState(false);

  const defaultImage = "https://images.unsplash.com/photo-1569409611680-1d67b2f9fed0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxnbG93aW5nJTIwdGlja2V0JTIwb3IlMjBjb3Vwb258ZW58MHx8fHwxNzc1MjYxMDU0fDA&ixlib=rb-4.1.0&q=85";

  useEffect(() => {
    const loadSponsor = async () => {
      const data = await getSponsorForTarget(coupon.id, parkId);
      setSponsor(data);
      if (data) {
        trackEvent(data.id, "view");
      }
    };
    loadSponsor();
  }, [coupon.id, parkId]);

  const handleSponsorClick = () => {
    if (!sponsor) return;
    trackEvent(sponsor.id, "click");
    window.open(sponsor.clickURL, "_blank");
  };

  return (
    <div 
      className={`bg-[#0F0F15] border border-white/5 rounded-none overflow-hidden relative ${
        disabled ? "opacity-60" : "hover:-translate-y-1 hover:border-[#01CDFE]/50 hover:shadow-[0_8px_32px_rgba(1,205,254,0.1)]"
      } transition-all duration-300`}
      data-testid={`coupon-card-${coupon.id}`}
    >
      {/* Discount Badge */}
      <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-[#FFB800] text-black text-sm font-bold rounded-full">
        {coupon.valoreSconto}
      </div>

      {/* Image Section */}
      <div className="relative h-40 overflow-hidden">
        {sponsor ? (
          <img
            src={sponsor.imageURL}
            onClick={handleSponsorClick}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            alt="Sponsor"
          />
        ) : (
          <img
            src={imgError ? defaultImage : (coupon.image || defaultImage)}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            alt={coupon.nomeAttrazione}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent" />
        
        {/* Sponsor Badge */}
        {sponsor && (
          <span 
            onClick={handleSponsorClick}
            className="absolute top-3 left-3 bg-[#01CDFE] text-black px-2 py-1 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#33D7FF] transition-colors flex items-center gap-1"
          >
            Sponsor <ExternalLink className="w-3 h-3" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-unbounded font-bold text-[#FFB800] text-lg">
          {coupon.nomeAttrazione}
        </h3>
        
        <p className="text-zinc-400 text-sm flex items-center gap-2">
          <Ticket className="w-4 h-4" />
          Giostra N° {coupon.numeroGiostra}
        </p>
        
        {coupon.nomeTitolare && (
          <p className="text-zinc-500 text-xs">{coupon.nomeTitolare}</p>
        )}

        {/* Cooldown */}
        {disabled && remaining && (
          <div className="flex items-center gap-2 text-[#FFB800] text-sm py-2 px-3 bg-[#FFB800]/10 border border-[#FFB800]/30">
            <Clock className="w-4 h-4 animate-pulse" />
            Disponibile tra {remaining}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => onUse && onUse(coupon)}
          disabled={disabled}
          data-testid={`coupon-use-btn-${coupon.id}`}
          className={`w-full mt-2 py-3 font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            disabled
              ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              : "bg-[#05D59E] text-black hover:shadow-[0_0_15px_rgba(5,213,158,0.5)]"
          }`}
        >
          {disabled ? (
            <>
              <Clock className="w-5 h-5" />
              NON DISPONIBILE
            </>
          ) : (
            <>
              <Ticket className="w-5 h-5" />
              USA ORA
            </>
          )}
        </button>
      </div>
    </div>
  );
}
