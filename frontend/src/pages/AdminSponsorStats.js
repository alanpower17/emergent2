import { useEffect, useState } from "react";
import { getSponsorStats, getSponsors } from "../services/sponsorService";
import { BarChart3, Eye, MousePointer, TrendingUp, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminSponsorStats() {
  const [stats, setStats] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, sponsorsData] = await Promise.all([
        getSponsorStats(),
        getSponsors(),
      ]);
      setStats(statsData);
      setSponsors(sponsorsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get sponsor details
  const getSponsorDetails = (sponsorId) => {
    return sponsors.find((s) => s.id === sponsorId);
  };

  // Calculate totals
  const totals = stats.reduce(
    (acc, s) => ({
      views: acc.views + s.views,
      clicks: acc.clicks + s.clicks,
    }),
    { views: 0, clicks: 0 }
  );
  totals.ctr = totals.views > 0 ? ((totals.clicks / totals.views) * 100).toFixed(2) : 0;

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
        <div className="max-w-7xl mx-auto">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna al pannello
          </Link>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#01CDFE]" />
            <h1 className="font-unbounded text-2xl font-bold text-white">
              Statistiche Sponsor
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0F0F15] border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-[#01CDFE]" />
              <span className="text-zinc-400">Visualizzazioni Totali</span>
            </div>
            <p className="text-4xl font-bold text-white">{totals.views.toLocaleString()}</p>
          </div>

          <div className="bg-[#0F0F15] border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MousePointer className="w-6 h-6 text-[#05D59E]" />
              <span className="text-zinc-400">Click Totali</span>
            </div>
            <p className="text-4xl font-bold text-white">{totals.clicks.toLocaleString()}</p>
          </div>

          <div className="bg-[#0F0F15] border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-[#FFB800]" />
              <span className="text-zinc-400">CTR Medio</span>
            </div>
            <p className="text-4xl font-bold text-white">{totals.ctr}%</p>
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div className="bg-[#0F0F15] border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="font-bold text-white">Dettaglio per Sponsor</h2>
          </div>

          {stats.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna statistica disponibile</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#05050A]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400">Sponsor</th>
                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-zinc-400">Views</th>
                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-zinc-400">Clicks</th>
                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-zinc-400">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.map((stat) => {
                    const sponsor = getSponsorDetails(stat.sponsorId);
                    return (
                      <tr key={stat.sponsorId} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {sponsor?.imageURL && (
                              <img
                                src={sponsor.imageURL}
                                alt=""
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="text-white font-medium truncate max-w-xs">
                                {sponsor?.clickURL || stat.sponsorId}
                              </p>
                              <p className="text-zinc-500 text-xs">
                                {sponsor?.couponId ? `Coupon: ${sponsor.couponId}` :
                                 sponsor?.parkId ? `Park: ${sponsor.parkId}` : "Globale"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-white font-bold">{stat.views.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-white font-bold">{stat.clicks.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            parseFloat(stat.ctr) >= 5 ? "bg-green-500/20 text-green-400" :
                            parseFloat(stat.ctr) >= 2 ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {stat.ctr}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
