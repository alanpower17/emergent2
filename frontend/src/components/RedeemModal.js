import { AlertTriangle, Check, X } from "lucide-react";

export default function RedeemModal({ coupon, onConfirm, onClose }) {
  if (!coupon) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#0F0F15] border border-white/10 p-6 max-w-md w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
        data-testid="redeem-modal"
      >
        {/* Header */}
        <div className="flex items-center gap-3 text-[#FFB800]">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="font-unbounded font-bold text-xl">Conferma utilizzo</h2>
        </div>

        {/* Content */}
        <div className="space-y-3 py-4 border-y border-white/10">
          <p className="text-white">
            Stai per utilizzare il coupon per:
          </p>
          <div className="bg-[#05050A] p-4 border-l-4 border-[#FF2A6D]">
            <p className="font-bold text-[#FFB800] text-lg">{coupon.nomeAttrazione}</p>
            <p className="text-zinc-400 text-sm">Sconto: {coupon.valoreSconto}</p>
          </div>
          <p className="text-zinc-400 text-sm">
            Una volta confermato, dovrai attendere 24 ore prima di poterlo riutilizzare.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            data-testid="redeem-cancel-btn"
            className="flex-1 py-3 border border-white/20 text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Annulla
          </button>
          <button
            onClick={onConfirm}
            data-testid="redeem-confirm-btn"
            className="flex-1 py-3 bg-[#05D59E] text-black font-semibold hover:shadow-[0_0_15px_rgba(5,213,158,0.5)] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            CONFERMA
          </button>
        </div>
      </div>
    </div>
  );
}
