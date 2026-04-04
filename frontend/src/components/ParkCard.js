import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Ticket } from "lucide-react";

export default function ParkCard({ park, distance, isFavorite, onToggle }) {
  const [imgError, setImgError] = useState(false);

  const defaultImage = "https://images.pexels.com/photos/1336429/pexels-photo-1336429.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

  return (
    <div 
      className="bg-[#0F0F15] border border-white/5 rounded-none overflow-hidden relative group hover:-translate-y-1 hover:border-[#01CDFE]/50 hover:shadow-[0_8px_32px_rgba(1,205,254,0.1)] transition-all duration-300"
      data-testid={`park-card-${park.id}`}
    >
      {/* Favorite Button */}
      {onToggle && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(park.id);
          }}
          data-testid={`favorite-btn-${park.id}`}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 backdrop-blur transition-all duration-300 ${
            isFavorite 
              ? "text-[#FF2A6D] scale-110 drop-shadow-[0_0_8px_rgba(255,42,109,0.5)]" 
              : "text-white/70 hover:text-[#FF2A6D]"
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      )}

      {/* Image */}
      <Link to={`/park/${park.id}`} data-testid={`park-link-${park.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={imgError ? defaultImage : (park.image || defaultImage)}
            onError={() => setImgError(true)}
            alt={park.nome}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent" />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/park/${park.id}`}>
          <h3 className="font-unbounded font-bold text-lg text-white mb-1 hover:text-[#01CDFE] transition-colors">
            {park.nome}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{park.citta || "Italia"}</span>
        </div>

        {/* Distance */}
        {distance !== null && distance !== undefined && (
          <p className="text-[#01CDFE] text-sm mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#01CDFE] animate-pulse" />
            A {distance.toFixed(1)} km da te
          </p>
        )}

        {/* CTA */}
        <Link 
          to={`/park/${park.id}`}
          data-testid={`park-coupons-btn-${park.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] hover:shadow-[0_0_15px_rgba(255,42,109,0.5)] transition-all duration-300"
        >
          <Ticket className="w-4 h-4" />
          Coupon disponibili
        </Link>
      </div>
    </div>
  );
}
