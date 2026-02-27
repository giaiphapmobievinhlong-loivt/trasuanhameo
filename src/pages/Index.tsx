import { useState, useCallback } from "react";
import { MenuItem, CartItem, OrderStatus, useAppState, formatVND } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import MenuGrid from "@/components/MenuGrid";
import Cart from "@/components/Cart";
import PaymentModal from "@/components/PaymentModal";
import ExpenseModal from "@/components/ExpenseModal";
import ReportView from "@/components/ReportView";
import OrderList from "@/components/OrderList";
import { CupSoda, BarChart3, PlusCircle, ClipboardList, LogOut } from "lucide-react";
import { toast } from "sonner";

type Tab = "pos" | "orders" | "report";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "pos", label: "Bán hàng", icon: <CupSoda size={16} /> },
  { key: "orders", label: "Đơn hàng", icon: <ClipboardList size={16} /> },
  { key: "report", label: "Báo cáo", icon: <BarChart3 size={16} /> },
];

const Index = () => {
  const { transactions, addTransaction, updateOrderStatus } = useAppState();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [tab, setTab] = useState<Tab>("pos");

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handlePaymentConfirm = (received: number) => {
    const change = received - total;
    const itemNames = cart.map((c) => `${c.name} x${c.quantity}`).join(", ");
    addTransaction({
      type: "income",
      items: [...cart],
      amount: total,
      description: itemNames,
      paymentReceived: received,
      changeGiven: change,
    });
    setCart([]);
    setShowPayment(false);
    toast.success(`Thanh toán thành công! Thối lại: ${formatVND(change)}`);
  };

  const handleAddExpense = (amount: number, description: string, type: "income" | "expense") => {
    addTransaction({ type, amount, description });
    toast.success(`Đã thêm ${type === "income" ? "khoản thu" : "khoản chi"}`);
  };

  const handleUpdateOrderStatus = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    const labels: Record<OrderStatus, string> = {
      pending: "Chờ xử lý",
      preparing: "Đang pha",
      ready: "Sẵn sàng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    toast.success(`Đơn hàng đã chuyển sang: ${labels[status]}`);
  };

  const pendingCount = transactions.filter(
    (t) => t.type === "income" && t.items?.length && t.orderStatus && t.orderStatus !== "completed" && t.orderStatus !== "cancelled"
  ).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-20 gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl sm:text-2xl">🧋</span>
          <h1 className="text-base sm:text-xl font-extrabold text-foreground hidden sm:block">Tea POS</h1>
        </div>

        {/* Responsive tab bar */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-muted rounded-xl p-0.5 sm:p-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                tab === t.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              <span className="hidden xs:inline sm:inline">{t.label}</span>
              {t.key === "orders" && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowExpense(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-secondary text-secondary-foreground text-xs sm:text-sm font-bold hover:bg-secondary/80 transition-colors shrink-0"
        >
          <PlusCircle size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Thu/Chi</span>
        </button>
      </header>

      {/* Content */}
      {tab === "pos" ? (
        <div className="flex-1 flex flex-col lg:flex-row">
          <main className="flex-1 p-4 overflow-y-auto">
            <MenuGrid onAddItem={addToCart} />
          </main>
          <aside className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 flex flex-col max-h-[50vh] lg:max-h-[calc(100vh-57px)] lg:sticky lg:top-[57px]">
            <Cart
              items={cart}
              onUpdateQty={updateQty}
              onRemove={removeFromCart}
              onCheckout={() => setShowPayment(true)}
              total={total}
            />
          </aside>
        </div>
      ) : tab === "orders" ? (
        <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
          <OrderList transactions={transactions} onUpdateStatus={handleUpdateOrderStatus} />
        </main>
      ) : (
        <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
          <ReportView transactions={transactions} />
        </main>
      )}

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        total={total}
        onConfirm={handlePaymentConfirm}
      />
      <ExpenseModal
        open={showExpense}
        onClose={() => setShowExpense(false)}
        onAdd={handleAddExpense}
      />
    </div>
  );
};

export default Index;
