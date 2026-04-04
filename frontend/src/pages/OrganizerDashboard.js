import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { getMyParks, createPark, updatePark } from "../services/parkService";
import { getCouponsByPark, deleteCoupon, deleteAllCoupons, syncCouponsFromSheet, createCoupon } from "../services/couponService";
import { getClaimsByPark, approveClaim, rejectClaim } from "../services/rideService";
import { 
  LayoutDashboard, Plus, Trash2, RefreshCw, Check, X, 
  FileSpreadsheet, Loader2, MapPin, Ticket, Users, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function OrganizerDashboard() {
  const { user } = useAuthContext();
  const [parks, setParks] = useState([]);
  const [selectedPark, setSelectedPark] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // New park form
  const [showNewPark, setShowNewPark] = useState(false);
  const [newParkForm, setNewParkForm] = useState({
    nome: "",
    citta: "",
    lat: "",
    lon: "",
    image: "",
  });

  // New coupon form
  const [showNewCoupon, setShowNewCoupon] = useState(false);
  const [newCouponForm, setNewCouponForm] = useState({
    nomeAttrazione: "",
    numeroGiostra: "",
    nomeTitolare: "",
    valoreSconto: "",
    image: "",
  });

  // Load parks
  useEffect(() => {
    loadParks();
  }, [user]);

  const loadParks = async () => {
    if (!user) return;
    try {
      const data = await getMyParks(user.uid);
      setParks(data);
      if (data.length > 0 && !selectedPark) {
        setSelectedPark(data[0]);
      }
    } catch (error) {
      console.error("Error loading parks:", error);
      toast.error("Errore nel caricamento dei parchi");
    } finally {
      setLoading(false);
    }
  };

  // Load coupons and claims when park changes
  useEffect(() => {
    if (selectedPark) {
      loadParkData();
    }
  }, [selectedPark]);

  const loadParkData = async () => {
    if (!selectedPark) return;
    try {
      const [couponsData, claimsData] = await Promise.all([
        getCouponsByPark(selectedPark.id),
        getClaimsByPark(selectedPark.id),
      ]);
      setCoupons(couponsData);
      setClaims(claimsData);
    } catch (error) {
      console.error("Error loading park data:", error);
    }
  };

  // Create new park
  const handleCreatePark = async (e) => {
    e.preventDefault();
    try {
      await createPark({
        ...newParkForm,
        lat: parseFloat(newParkForm.lat) || null,
        lon: parseFloat(newParkForm.lon) || null,
        organizerIds: [user.uid],
      });
      toast.success("Luna Park creato! In attesa di approvazione.");
      setShowNewPark(false);
      setNewParkForm({ nome: "", citta: "", lat: "", lon: "", image: "" });
      loadParks();
    } catch (error) {
      console.error("Error creating park:", error);
      toast.error("Errore nella creazione del parco");
    }
  };

  // Create new coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!selectedPark) return;
    try {
      await createCoupon({
        ...newCouponForm,
        numeroGiostra: parseInt(newCouponForm.numeroGiostra) || 1,
        parkId: selectedPark.id,
      });
      toast.success("Coupon creato!");
      setShowNewCoupon(false);
      setNewCouponForm({ nomeAttrazione: "", numeroGiostra: "", nomeTitolare: "", valoreSconto: "", image: "" });
      loadParkData();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Errore nella creazione del coupon");
    }
  };

  // Sync from Google Sheet
  const handleSync = async () => {
    const url = prompt("Inserisci URL del Google Sheet JSON:");
    if (!url || !selectedPark) return;

    setSyncing(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      const result = await syncCouponsFromSheet(selectedPark.id, data);
      toast.success(`Sync completato! Creati: ${result.created}, Aggiornati: ${result.updated}, Rimossi: ${result.removed}`);
      loadParkData();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Errore nel caricamento del foglio");
    } finally {
      setSyncing(false);
    }
  };

  // Handle claim actions
  const handleApproveClaim = async (claim) => {
    try {
      await approveClaim(claim, user.uid);
      toast.success("Richiesta approvata!");
      loadParkData();
    } catch (error) {
      console.error("Error approving claim:", error);
      toast.error("Errore nell'approvazione");
    }
  };

  const handleRejectClaim = async (claimId) => {
    try {
      await rejectClaim(claimId);
      toast.success("Richiesta rifiutata");
      loadParkData();
    } catch (error) {
      console.error("Error rejecting claim:", error);
      toast.error("Errore nel rifiuto");
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
            <LayoutDashboard className="w-8 h-8 text-[#01CDFE]" />
            <h1 className="font-unbounded text-2xl font-bold text-white">
              Dashboard Organizzatore
            </h1>
          </div>

          <button
            onClick={() => setShowNewPark(true)}
            data-testid="create-park-btn"
            className="flex items-center gap-2 px-4 py-2 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] hover:shadow-[0_0_15px_rgba(255,42,109,0.5)] transition-all"
          >
            <Plus className="w-5 h-5" />
            Nuovo Luna Park
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {parks.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400 text-lg mb-4">Non hai ancora nessun Luna Park</p>
            <button
              onClick={() => setShowNewPark(true)}
              className="px-6 py-3 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] transition-all"
            >
              Crea il tuo primo Luna Park
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Park Selector */}
            <div className="lg:col-span-1">
              <div className="bg-[#0F0F15] border border-white/5 p-4 space-y-3">
                <h3 className="font-bold text-white">I Tuoi Parchi</h3>
                {parks.map((park) => (
                  <button
                    key={park.id}
                    onClick={() => setSelectedPark(park)}
                    data-testid={`select-park-${park.id}`}
                    className={`w-full p-3 text-left border transition-all ${
                      selectedPark?.id === park.id
                        ? "border-[#01CDFE] bg-[#01CDFE]/10"
                        : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold text-white">{park.nome}</p>
                    <p className="text-zinc-400 text-sm">{park.citta}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                      park.status === "approved" ? "bg-green-500/20 text-green-400" :
                      park.status === "rejected" ? "bg-red-500/20 text-red-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {park.status === "approved" ? "Approvato" :
                       park.status === "rejected" ? "Rifiutato" : "In attesa"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {selectedPark && (
                <>
                  {/* Park Info */}
                  <div className="bg-[#0F0F15] border border-white/5 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-unbounded text-xl font-bold text-white">{selectedPark.nome}</h2>
                        <p className="text-zinc-400">{selectedPark.citta}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-[#01CDFE]/20 text-[#01CDFE] text-sm font-bold">
                          {coupons.length} Coupon
                        </span>
                        <span className="px-3 py-1 bg-[#FFB800]/20 text-[#FFB800] text-sm font-bold">
                          {claims.filter(c => c.status === "pending").length} Richieste
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Management */}
                  <div className="bg-[#0F0F15] border border-white/5 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-[#FFB800]" />
                        Gestione Coupon
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSync}
                          disabled={syncing}
                          data-testid="sync-sheet-btn"
                          className="flex items-center gap-2 px-3 py-2 bg-[#01CDFE] text-black font-semibold hover:bg-[#33D7FF] transition-all disabled:opacity-50"
                        >
                          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                          Sync Google Sheet
                        </button>
                        <button
                          onClick={() => setShowNewCoupon(true)}
                          data-testid="add-coupon-btn"
                          className="flex items-center gap-2 px-3 py-2 bg-[#05D59E] text-black font-semibold hover:shadow-[0_0_15px_rgba(5,213,158,0.5)] transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Aggiungi
                        </button>
                        {coupons.length > 0 && (
                          <button
                            onClick={async () => {
                              if (window.confirm("Sei sicuro di voler eliminare tutti i coupon?")) {
                                await deleteAllCoupons(selectedPark.id);
                                toast.success("Tutti i coupon eliminati");
                                loadParkData();
                              }
                            }}
                            data-testid="delete-all-coupons-btn"
                            className="flex items-center gap-2 px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Elimina Tutti
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Coupons List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {coupons.length === 0 ? (
                        <p className="text-zinc-500 text-center py-8">Nessun coupon</p>
                      ) : (
                        coupons.map((coupon) => (
                          <div
                            key={coupon.id}
                            className="flex items-center justify-between p-3 bg-[#05050A] border border-white/5"
                          >
                            <div>
                              <p className="font-semibold text-white">{coupon.nomeAttrazione}</p>
                              <p className="text-zinc-400 text-sm">
                                Giostra #{coupon.numeroGiostra} • {coupon.valoreSconto}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                await deleteCoupon(coupon.id);
                                toast.success("Coupon eliminato");
                                loadParkData();
                              }}
                              data-testid={`delete-coupon-${coupon.id}`}
                              className="p-2 text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Claims Management */}
                  <div className="bg-[#0F0F15] border border-white/5 p-6 space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#FFB800]" />
                      Richieste Gestori Giostre
                    </h3>

                    <div className="space-y-2">
                      {claims.filter(c => c.status === "pending").length === 0 ? (
                        <p className="text-zinc-500 text-center py-8">Nessuna richiesta in attesa</p>
                      ) : (
                        claims.filter(c => c.status === "pending").map((claim) => (
                          <div
                            key={claim.id}
                            className="flex items-center justify-between p-3 bg-[#05050A] border border-white/5"
                          >
                            <div>
                              <p className="text-white">Coupon: {claim.couponId}</p>
                              <p className="text-zinc-400 text-sm">Richiesto da: {claim.requestedBy}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveClaim(claim)}
                                data-testid={`approve-claim-${claim.id}`}
                                className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectClaim(claim.id)}
                                data-testid={`reject-claim-${claim.id}`}
                                className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Park Modal */}
      {showNewPark && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0F15] border border-white/10 p-6 max-w-md w-full space-y-4">
            <h2 className="font-unbounded font-bold text-xl text-white">Nuovo Luna Park</h2>
            <form onSubmit={handleCreatePark} className="space-y-4">
              <input
                type="text"
                placeholder="Nome Luna Park"
                value={newParkForm.nome}
                onChange={(e) => setNewParkForm({ ...newParkForm, nome: e.target.value })}
                required
                data-testid="new-park-name"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Città"
                value={newParkForm.citta}
                onChange={(e) => setNewParkForm({ ...newParkForm, citta: e.target.value })}
                data-testid="new-park-city"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitudine"
                  value={newParkForm.lat}
                  onChange={(e) => setNewParkForm({ ...newParkForm, lat: e.target.value })}
                  data-testid="new-park-lat"
                  className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitudine"
                  value={newParkForm.lon}
                  onChange={(e) => setNewParkForm({ ...newParkForm, lon: e.target.value })}
                  data-testid="new-park-lon"
                  className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
                />
              </div>
              <input
                type="url"
                placeholder="URL Immagine"
                value={newParkForm.image}
                onChange={(e) => setNewParkForm({ ...newParkForm, image: e.target.value })}
                data-testid="new-park-image"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewPark(false)}
                  className="flex-1 py-3 border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  data-testid="submit-new-park"
                  className="flex-1 py-3 bg-[#FF2A6D] text-white font-semibold hover:bg-[#FF528A] transition-all"
                >
                  Crea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Coupon Modal */}
      {showNewCoupon && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0F15] border border-white/10 p-6 max-w-md w-full space-y-4">
            <h2 className="font-unbounded font-bold text-xl text-white">Nuovo Coupon</h2>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <input
                type="text"
                placeholder="Nome Attrazione"
                value={newCouponForm.nomeAttrazione}
                onChange={(e) => setNewCouponForm({ ...newCouponForm, nomeAttrazione: e.target.value })}
                required
                data-testid="new-coupon-name"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <input
                type="number"
                placeholder="Numero Giostra"
                value={newCouponForm.numeroGiostra}
                onChange={(e) => setNewCouponForm({ ...newCouponForm, numeroGiostra: e.target.value })}
                data-testid="new-coupon-number"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Nome Titolare"
                value={newCouponForm.nomeTitolare}
                onChange={(e) => setNewCouponForm({ ...newCouponForm, nomeTitolare: e.target.value })}
                data-testid="new-coupon-owner"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Valore Sconto (es. -20%)"
                value={newCouponForm.valoreSconto}
                onChange={(e) => setNewCouponForm({ ...newCouponForm, valoreSconto: e.target.value })}
                required
                data-testid="new-coupon-discount"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <input
                type="url"
                placeholder="URL Immagine"
                value={newCouponForm.image}
                onChange={(e) => setNewCouponForm({ ...newCouponForm, image: e.target.value })}
                data-testid="new-coupon-image"
                className="w-full p-3 bg-[#05050A] border border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF2A6D] focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewCoupon(false)}
                  className="flex-1 py-3 border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  data-testid="submit-new-coupon"
                  className="flex-1 py-3 bg-[#05D59E] text-black font-semibold hover:shadow-[0_0_15px_rgba(5,213,158,0.5)] transition-all"
                >
                  Crea Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
