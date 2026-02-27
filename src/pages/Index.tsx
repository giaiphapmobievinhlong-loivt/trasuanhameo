import { useState, useCallback } from "react";
import { MenuItem, CartItem, useAppState, formatVND } from "@/lib/store";
import MenuGrid from "@/components/MenuGrid";
import Cart from "@/components/Cart";
import PaymentModal from "@/components/PaymentModal";
import ExpenseModal from "@/components/ExpenseModal";
import ReportView from "@/components/ReportView";
import { CupSoda, BarChart3, PlusCircle } from "lucide-react";
import { toast } from "sonner";

type Tab = "pos" | "report";

const Index = () => {
  const { transactions, addTransaction } = useAppState();
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧋</span>
          <h1 className="text-xl font-extrabold text-foreground">Tea POS</h1>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setTab("pos")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === "pos"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CupSoda size={16} />
            Bán hàng
          </button>
          <button
            onClick={() => setTab("report")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === "report"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 size={16} />
            Báo cáo
          </button>
        </div>
        <button
          onClick={() => setShowExpense(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold hover:bg-secondary/80 transition-colors"
        >
          <PlusCircle size={16} />
          Thu/Chi
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
