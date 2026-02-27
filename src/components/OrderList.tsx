import { useMemo, useState } from "react";
import { Transaction, OrderStatus, formatVND } from "@/lib/store";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Package, Clock, ChefHat, CheckCircle2, XCircle, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OrderListProps {
  transactions: Transaction[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: "Chờ xử lý", icon: <Clock size={14} />, className: "bg-warning/15 text-warning border-warning/30" },
  preparing: { label: "Đang pha", icon: <ChefHat size={14} />, className: "bg-primary/15 text-primary border-primary/30" },
  ready: { label: "Sẵn sàng", icon: <Package size={14} />, className: "bg-accent/15 text-accent border-accent/30" },
  completed: { label: "Hoàn thành", icon: <CheckCircle2 size={14} />, className: "bg-success/15 text-success border-success/30" },
  cancelled: { label: "Đã hủy", icon: <XCircle size={14} />, className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
};

type FilterStatus = "all" | OrderStatus;

export default function OrderList({ transactions, onUpdateStatus }: OrderListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const orders = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income" && t.items && t.items.length > 0)
      .filter((t) => filterStatus === "all" || t.orderStatus === filterStatus);
  }, [transactions, filterStatus]);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xử lý" },
    { key: "preparing", label: "Đang pha" },
    { key: "ready", label: "Sẵn sàng" },
    { key: "completed", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Filter size={16} className="text-muted-foreground shrink-0" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === f.key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order cards */}
      {orders.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground text-sm">
          Chưa có đơn hàng nào
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {orders.map((order) => {
            const status = order.orderStatus || "pending";
            const config = STATUS_CONFIG[status];
            const nextStatus = NEXT_STATUS[status];

            return (
              <div key={order.id} className="glass-card rounded-xl overflow-hidden">
                {/* Order header */}
                <div className="p-3 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-muted-foreground">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.className}`}>
                      <span className="mr-1">{config.icon}</span>
                      {config.label}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {format(parseISO(order.date), "HH:mm", { locale: vi })}
                  </span>
                </div>

                {/* Items */}
                <div className="p-3 space-y-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {item.emoji} {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                      </span>
                      <span className="text-foreground font-semibold shrink-0 ml-2">
                        {formatVND(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-3 py-2 border-t border-border/50 flex items-center justify-between bg-muted/30">
                  <span className="text-sm font-extrabold text-foreground">
                    {formatVND(order.amount)}
                  </span>
                  <div className="flex gap-1.5">
                    {status !== "completed" && status !== "cancelled" && (
                      <button
                        onClick={() => onUpdateStatus(order.id, "cancelled")}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        Hủy
                      </button>
                    )}
                    {nextStatus && (
                      <button
                        onClick={() => onUpdateStatus(order.id, nextStatus)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        {STATUS_CONFIG[nextStatus].label}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
