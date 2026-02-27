import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (amount: number, description: string, type: "income" | "expense") => void;
}

export default function ExpenseModal({ open, onClose, onAdd }: ExpenseModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    const num = parseInt(amount);
    if (num > 0 && description.trim()) {
      onAdd(num, description.trim(), type);
      setAmount("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">📋 Thêm thu/chi</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType("income")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === "income"
                  ? "bg-success text-success-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Thu vào
            </button>
            <button
              onClick={() => setType("expense")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === "expense"
                  ? "bg-destructive text-destructive-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Chi ra
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Số tiền</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền..."
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Mô tả</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Mua nguyên liệu..."
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!amount || !description.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Thêm giao dịch
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
