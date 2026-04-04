import { db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function useFavorites(user, favorites, setFavorites) {
  const toggleFavorite = async (parkId) => {
    if (!user) return;
    
    let updated;
    if (favorites.includes(parkId)) {
      updated = favorites.filter((id) => id !== parkId);
    } else {
      updated = [...favorites, parkId];
    }
    setFavorites(updated);
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        favorites: updated,
      });
    } catch (error) {
      console.error("Error updating favorites:", error);
      // Revert on error
      setFavorites(favorites);
    }
  };

  return { toggleFavorite };
}
