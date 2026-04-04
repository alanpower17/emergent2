import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import useGeolocation from "../hooks/useGeolocation";
import useFavorites from "../hooks/useFavorites";
import { getAllParks } from "../services/parkService";
import { getDistance } from "../utils/distance";
import ParkCard from "../components/ParkCard";
import { Heart, Loader2 } from "lucide-react";

export default function Favorites() {
  const { user } = useAuthContext();
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setParks(data);
      } catch (error) {
        console.error("Error loading parks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadParks();
  }, []);

  // Filter only favorites
  const favoriteParks = parks
    .filter((p) => favorites.includes(p.id))
    .map((p) => {
      let distance = null;
      if (location && p.lat && p.lon) {
        distance = getDistance(location.lat, location.lng, p.lat, p.lon);
      }
      return { ...p, distance, isFavorite: true };
    })
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return (a.nome || "").localeCompare(b.nome || "");
    });

  return (
    <div className="min-h-screen bg-[#05050A] pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-[#0F0F15] border-b border-white/5 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-[#FF2A6D] fill-current" />
            <h1 className="font-unbounded text-3xl font-bold text-white">
              I Tuoi Preferiti
            </h1>
          </div>
          <p className="text-zinc-400 mt-2">
            I luna park che hai salvato
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#FF2A6D] animate-spin" />
          </div>
        ) : favoriteParks.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400 text-lg mb-2">
              Non hai ancora nessun preferito
            </p>
            <p className="text-zinc-500">
              Tocca il cuore su un luna park per aggiungerlo ai preferiti
            </p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="favorites-grid"
          >
            {favoriteParks.map((park) => (
              <ParkCard
                key={park.id}
                park={park}
                distance={park.distance}
                isFavorite={park.isFavorite}
                onToggle={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
