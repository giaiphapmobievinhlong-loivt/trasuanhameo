import { CartItem, formatVND } from "@/lib/store";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartProps {
  items: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  total: number;
}

export default function Cart({ items, onUpdateQty, onRemove, onCheckout, total }: CartProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-extrabold text-foreground mb-3">🛒 Đơn hàng</h2>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Chưa có sản phẩm nào
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2 animate-slide-up"
            >
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{formatVND(item.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateQty(item.id, -1)}
                  className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.id, 1)}
                  className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-3 mt-3 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-muted-foreground">Tổng cộng</span>
          <span className="text-xl font-extrabold text-primary">{formatVND(total)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
}
