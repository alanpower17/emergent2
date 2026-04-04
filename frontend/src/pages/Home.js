import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import useGeolocation from "../hooks/useGeolocation";
import useDebounce from "../hooks/useDebounce";
import useFavorites from "../hooks/useFavorites";
import { getAllParks } from "../services/parkService";
import { getDistance } from "../utils/distance";
import ParkCard from "../components/ParkCard";
import { Search, MapPin, Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const { user } = useAuthContext();
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { location } = useGeolocation();
  const [favorites, setFavorites] = useState([]);

  const { toggleFavorite } = useFavorites(user, favorites, setFavorites);

  useEffect(() => {
    if (user?.favorites) {
      setFavorites(user.favorites);
    }
  }, [user]);

  useEffect(() => {
    const loadParks = async () => {
      try {
        const data = await getAllParks();
        // Filter only approved parks for public view
        const approvedParks = data.filter(p => p.status === "approved" || !p.status);
        setParks(approvedParks);
      } catch (error) {
        console.error("Error loading parks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadParks();
  }, []);

  // Process parks: add distance, favorites, filter, sort
  const processedParks = parks
    .map((p) => {
      let distance = null;
      if (location && p.lat && p.lon) {
        distance = getDistance(location.lat, location.lng, p.lat, p.lon);
      }
      return {
        ...p,
        distance,
        isFavorite: favorites.includes(p.id),
      };
    })
    .filter(
      (p) =>
        p.nome?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.citta?.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      // Then by distance
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      // Then alphabetically
      return (a.nome || "").localeCompare(b.nome || "");
    });

  return (
    <div className="min-h-screen bg-[#05050A] pb-24 md:pb-8">
      {/* Hero Section */}
      <div 
        className="relative py-12 px-6 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1642537389593-cf3f195905d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwzfHxuZW9uJTIwbGlnaHRzJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzUyNjEwNTR8MA&ixlib=rb-4.1.0&q=85')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A] via-[#05050A]/80 to-[#05050A]" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <img
            src="https://i.postimg.cc/qqcVPvq8/logo-e-scritta-senza-sfondo.png"
            alt="MyLunaPark"
            className="mx-auto h-24 md:h-32"
            data-testid="hero-logo"
          />
          
          <p className="text-zinc-400 text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFB800]" />
            Scopri i migliori luna park italiani
            <Sparkles className="w-5 h-5 text-[#FFB800]" />
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cerca per nome o città..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="search-input"
              className="w-full pl-12 pr-4 py-4 bg-[#0F0F15] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:ring-1 focus:ring-[#FF2A6D] focus:outline-none transition-all"
            />
          </div>

          {/* Location Status */}
          {location && (
            <p className="text-[#01CDFE] text-sm flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              Posizione rilevata - risultati ordinati per distanza
            </p>
          )}
        </div>
      </div>

      {/* Parks Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#FF2A6D] animate-spin" />
          </div>
        ) : processedParks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 text-lg">
              {search ? "Nessun luna park trovato per la tua ricerca" : "Nessun luna park disponibile"}
            </p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="parks-grid"
          >
            {processedParks.map((park) => (
              <ParkCard
                key={park.id}
                park={park}
                distance={park.distance}
                isFavorite={park.isFavorite}
                onToggle={user ? toggleFavorite : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
