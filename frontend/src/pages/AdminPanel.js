import { useEffect, useState } from "react";
import { getAllParks, approvePark, rejectPark, deletePark } from "../services/parkService";
import { getSponsors, createSponsor, deleteSponsor, getSponsorStats } from "../services/sponsorService";
import { 
  LayoutDashboard, Check, X, Trash2, Plus, Loader2,
  BarChart3, Eye, MousePointer, Image, Link as LinkIcon,
  MapPin, Building
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("parks");
  const [parks, setParks] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // New sponsor form
  const [showNewSponsor, setShowNewSponsor] = useState(false);
  const [newSponsorForm, setNewSponsorForm] = useState({
    imageURL: "",
    clickURL: "",
    couponId: "",
    parkId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [parksData, sponsorsData, statsData] = await Promise.all([
        getAllParks(),
        getSponsors(),
        getSponsorStats(),
      ]);
      setParks(parksData);
      setSponsors(sponsorsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Park actions
  const handleApprovePark = async (parkId) => {
    try {
      await approvePark(parkId);
      toast.success("Luna Park approvato!");
      loadData();
    } catch (error) {
      console.error("Error approving park:", error);
      toast.error("Errore nell'approvazione");
    }
  };

  const handleRejectPark = async (parkId) => {
    try {
      await rejectPark(parkId);
      toast.success("Luna Park rifiutato");
      loadData();
    } catch (error) {
      console.error("Error rejecting park:", error);
      toast.error("Errore nel rifiuto");
    }
  };

  const handleDeletePark = async (parkId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo luna park?")) return;
    try {
      await deletePark(parkId);
      toast.success("Luna Park eliminato");
      loadData();
    } catch (error) {
      console.error("Error deleting park:", error);
      toast.error("Errore nell'eliminazione");
    }
  };

  // Sponsor actions
  const handleCreateSponsor = async (e) => {
    e.preventDefault();
    try {
      await createSponsor(newSponsorForm);
      toast.success("Sponsor creato!");
      setShowNewSponsor(false);
      setNewSponsorForm({ imageURL: "", clickURL: "", couponId: "", parkId: "" });
      loadData();
    } catch (error) {
      console.error("Error creating sponsor:", error);
      toast.error("Errore nella creazione");
    }
  };

  const handleDeleteSponsor = async (sponsorId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo sponsor?")) return;
    try {
      await deleteSponsor(sponsorId);
      toast.success("Sponsor eliminato");
      loadData();
    } catch (error) {
      console.error("Error deleting sponsor:", error);
      toast.error("Errore nell'eliminazione");
    }
  };

  // Get stats for a sponsor
  const getSponsorStat = (sponsorId) => {
    return stats.find((s) => s.sponsorId === sponsorId) || { views: 0, clicks: 0, ctr: 0 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF2A6D] animate-spin" />
      </div>
    );
  }

  const pendingParks = parks.filter((p) => p.status === "pending");

  return (
    <div className="min-h-screen bg-[#05050A] pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-[#0F0F15] border-b border-white/5 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-[#FF2A6D]" />
            <h1 className="font-unbounded text-2xl font-bold text-white">
              Pannello Admin
            </h1>
          </div>

          <Link
            to="/admin/stats"
            data-testid="view-stats-btn"
            className="flex items-center gap-2 px-4 py-2 border border-[#01CDFE] text-[#01CDFE] hover:bg-[#01CDFE] hover:text-black transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            Statistiche Dettagliate
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("parks")}
            data-testid="tab-parks"
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === "parks"
                ? "bg-[#FF2A6D] text-white"
                : "bg-[#0F0F15] text-zinc-400 hover:text-white"
            }`}
          >
            Luna Park
            {pendingParks.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#FFB800] text-black text-xs rounded-full">
                {pendingParks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sponsors")}
            data-testid="tab-sponsors"
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === "sponsors"
                ? "bg-[#FF2A6D] text-white"
                : "bg-[#0F0F15] text-zinc-400 hover:text-white"
            }`}
          >
            Sponsor
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Parks Tab */}
        {activeTab === "parks" && (
          <div className="space-y-6">
            {/* Pending Parks */}
            {pendingParks.length > 0 && (
              <div className="bg-[#0F0F15] border border-white/5 p-6 space-y-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#FFB800]" />
                  In Attesa di Approvazione ({pendingParks.length})
                </h2>
                <div className="space-y-2">
                  {pendingParks.map((park) => (
                    <div
                      key={park.id}
                      className="flex items-center justify-between p-4 bg-[#05050A] border border-yellow-500/30"
                      data-testid={`pending-park-${park.id}`}
                    >
                      <div>
                        <p className="font-semibold text-white">{park.nome}</p>
                        <p className="text-zinc-400 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {park.citta || "N/A"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprovePark(park.id)}
                          data-testid={`approve-park-${park.id}`}
                          className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectPark(park.id)}
                          data-testid={`reject-park-${park.id}`}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Parks */}
            <div className="bg-[#0F0F15] border border-white/5 p-6 space-y-4">
              <h2 className="font-bold text-white">Tutti i Luna Park ({parks.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {parks.map((park) => (
                  <div
                    key={park.id}
                    className="flex items-center justify-between p-3 bg-[#05050A] border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${
                        park.status === "approved" ? "bg-green-500" :
                        park.status === "rejected" ? "bg-red-500" :
                        "bg-yellow-500"
                      }`} />
                      <div>
                        <p className="font-semibold text-white">{park.nome}</p>
                        <p className="text-zinc-400 text-sm">{park.citta}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePark(park.id)}
                      data-testid={`delete-park-${park.id}`}
                      className="p-2 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sponsors Tab */}
        {activeTab === "sponsors" && (
          <div className="space-y-6">
            {/* New Sponsor Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewSponsor(true)}
                data-testid="create-sponsor-btn"
                className="flex items-center gap-2 px-4 py-2 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] hover:shadow-[0_0_15px_rgba(255,42,109,0.5)] transition-all"
              >
                <Plus className="w-5 h-5" />
                Nuovo Sponsor
              </button>
            </div>

            {/* Sponsors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sponsors.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-zinc-400">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuno sponsor configurato</p>
                </div>
              ) : (
                sponsors.map((sponsor) => {
                  const stat = getSponsorStat(sponsor.id);
                  return (
                    <div
                      key={sponsor.id}
                      className="bg-[#0F0F15] border border-white/5 p-4 space-y-4"
                      data-testid={`sponsor-card-${sponsor.id}`}
                    >
                      {/* Image Preview */}
                      <div className="relative h-32 bg-[#05050A] rounded overflow-hidden">
                        <img
                          src={sponsor.imageURL}
                          alt="Sponsor"
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.src = "https://via.placeholder.com/400x200?text=No+Image"}
                        />
                      </div>

                      {/* Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <LinkIcon className="w-4 h-4" />
                          <a href={sponsor.clickURL} target="_blank" rel="noopener noreferrer" className="text-[#01CDFE] hover:underline truncate">
                            {sponsor.clickURL}
                          </a>
                        </div>
                        <p className="text-zinc-500 text-xs">
                          {sponsor.couponId ? `Coupon: ${sponsor.couponId}` : 
                           sponsor.parkId ? `Park: ${sponsor.parkId}` : "Globale"}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-[#05050A] text-center">
                          <Eye className="w-4 h-4 mx-auto text-[#01CDFE] mb-1" />
                          <p className="text-white font-bold">{stat.views}</p>
                          <p className="text-zinc-500 text-xs">Views</p>
                        </div>
                        <div className="p-2 bg-[#05050A] text-center">
                          <MousePointer className="w-4 h-4 mx-auto text-[#05D59E] mb-1" />
                          <p className="text-white font-bold">{stat.clicks}</p>
                          <p className="text-zinc-500 text-xs">Clicks</p>
                        </div>
                        <div className="p-2 bg-[#05050A] text-center">
                          <BarChart3 className="w-4 h-4 mx-auto text-[#FFB800] mb-1" />
                          <p className="text-white font-bold">{stat.ctr}%</p>
                          <p className="text-zinc-500 text-xs">CTR</p>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteSponsor(sponsor.id)}
                        data-testid={`delete-sponsor-${sponsor.id}`}
                        className="w-full py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Elimina
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Sponsor Modal */}
      {showNewSponsor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0F15] border border-white/10 p-6 max-w-md w-full space-y-4">
            <h2 className="font-unbounded font-bold text-xl text-white">Nuovo Sponsor</h2>
            <form onSubmit={handleCreateSponsor} className="space-y-4">
              <input
                type="url"
                placeholder="URL Immagine"
                value={newSponsorForm.imageURL}
                onChange={(e) => setNewSponsorForm({ ...newSponsorForm, imageURL: e.target.value })}
                required
                data-testid="new-sponsor-image"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <input
                type="url"
                placeholder="URL Click (landing page)"
                value={newSponsorForm.clickURL}
                onChange={(e) => setNewSponsorForm({ ...newSponsorForm, clickURL: e.target.value })}
                required
                data-testid="new-sponsor-click-url"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Coupon ID (opzionale, lascia vuoto per globale)"
                value={newSponsorForm.couponId}
                onChange={(e) => setNewSponsorForm({ ...newSponsorForm, couponId: e.target.value })}
                data-testid="new-sponsor-coupon"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Park ID (opzionale)"
                value={newSponsorForm.parkId}
                onChange={(e) => setNewSponsorForm({ ...newSponsorForm, parkId: e.target.value })}
                data-testid="new-sponsor-park"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewSponsor(false)}
                  className="flex-1 py-3 border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  data-testid="submit-new-sponsor"
                  className="flex-1 py-3 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] transition-all"
                >
                  Crea Sponsor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
