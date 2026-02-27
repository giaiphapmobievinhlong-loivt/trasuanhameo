import { useState } from "react";
import { formatVND } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (received: number) => void;
}

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export default function PaymentModal({ open, onClose, total, onConfirm }: PaymentModalProps) {
  const [received, setReceived] = useState("");
  const receivedNum = parseInt(received) || 0;
  const change = receivedNum - total;

  const handleQuickAmount = (amount: number) => {
    setReceived(String(amount));
  };

  const handleConfirm = () => {
    if (receivedNum >= total) {
      onConfirm(receivedNum);
      setReceived("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setReceived(""); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">💰 Thanh toán</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-secondary rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
            <p className="text-3xl font-extrabold text-primary">{formatVND(total)}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Tiền khách đưa</label>
            <input
              type="number"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              placeholder="Nhập số tiền..."
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickAmount(amt)}
                className="px-3 py-2 rounded-lg bg-muted text-sm font-semibold hover:bg-muted/70 transition-colors text-foreground"
              >
                {formatVND(amt)}
              </button>
            ))}
          </div>

          {receivedNum > 0 && (
            <div className={`rounded-xl p-4 text-center animate-slide-up ${
              change >= 0 ? "bg-success/10" : "bg-destructive/10"
            }`}>
              <p className="text-sm font-semibold mb-1">
                {change >= 0 ? "💵 Tiền thối lại" : "⚠️ Chưa đủ tiền"}
              </p>
              <p className={`text-2xl font-extrabold ${
                change >= 0 ? "text-success" : "text-destructive"
              }`}>
                {formatVND(Math.abs(change))}
              </p>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={receivedNum < total}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Xác nhận thanh toán
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
