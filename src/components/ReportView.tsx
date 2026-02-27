import { useMemo, useState } from "react";
import { Transaction, formatVND } from "@/lib/store";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from "lucide-react";
import { format, isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface ReportViewProps {
  transactions: Transaction[];
}

type Period = "today" | "week" | "month" | "all";

export default function ReportView({ transactions }: ReportViewProps) {
  const [period, setPeriod] = useState<Period>("today");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const d = parseISO(t.date);
      if (period === "today") return isToday(d);
      if (period === "week") return isThisWeek(d, { weekStartsOn: 1 });
      if (period === "month") return isThisMonth(d);
      return true;
    });
  }, [transactions, period]);

  const stats = useMemo(() => {
    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const orders = filtered.filter((t) => t.type === "income" && t.items && t.items.length > 0).length;
    return { income, expense, profit: income - expense, orders };
  }, [filtered]);

  const periods: { key: Period; label: string }[] = [
    { key: "today", label: "Hôm nay" },
    { key: "week", label: "Tuần này" },
    { key: "month", label: "Tháng này" },
    { key: "all", label: "Tất cả" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              period === p.key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<TrendingUp size={20} />} label="Doanh thu" value={formatVND(stats.income)} color="text-success" />
        <StatCard icon={<TrendingDown size={20} />} label="Chi phí" value={formatVND(stats.expense)} color="text-destructive" />
        <StatCard icon={<DollarSign size={20} />} label="Lợi nhuận" value={formatVND(stats.profit)} color="text-primary" />
        <StatCard icon={<ShoppingBag size={20} />} label="Đơn hàng" value={String(stats.orders)} color="text-accent" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-foreground">Lịch sử giao dịch</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Chưa có giao dịch nào</div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${
                  t.type === "income" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                }`}>
                  {t.type === "income" ? "+" : "−"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(t.date), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
                <span className={`text-sm font-extrabold ${
                  t.type === "income" ? "text-success" : "text-destructive"
                }`}>
                  {t.type === "income" ? "+" : "−"}{formatVND(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="glass-card rounded-xl p-4 animate-slide-up">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-xs text-muted-foreground font-semibold">{label}</p>
      <p className={`text-lg font-extrabold ${color} mt-0.5`}>{value}</p>
    </div>
  );
}
