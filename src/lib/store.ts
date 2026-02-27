import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Json } from "@/integrations/supabase/types";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  items?: CartItem[];
  amount: number;
  description: string;
  date: string;
  paymentReceived?: number;
  changeGiven?: number;
  orderStatus?: OrderStatus;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: "1", name: "Trà sữa truyền thống", price: 25000, category: "Trà sữa", emoji: "🧋" },
  { id: "2", name: "Trà sữa matcha", price: 30000, category: "Trà sữa", emoji: "🍵" },
  { id: "3", name: "Trà sữa socola", price: 30000, category: "Trà sữa", emoji: "🍫" },
  { id: "4", name: "Trà sữa khoai môn", price: 30000, category: "Trà sữa", emoji: "🟣" },
  { id: "5", name: "Trà sữa dâu", price: 32000, category: "Trà sữa", emoji: "🍓" },
  { id: "6", name: "Trà đào cam sả", price: 28000, category: "Trà trái cây", emoji: "🍑" },
  { id: "7", name: "Trà vải", price: 28000, category: "Trà trái cây", emoji: "🫐" },
  { id: "8", name: "Trà chanh leo", price: 25000, category: "Trà trái cây", emoji: "🍋" },
  { id: "9", name: "Topping trân châu", price: 5000, category: "Topping", emoji: "⚫" },
  { id: "10", name: "Topping thạch", price: 5000, category: "Topping", emoji: "🟤" },
  { id: "11", name: "Topping pudding", price: 7000, category: "Topping", emoji: "🍮" },
  { id: "12", name: "Topping kem cheese", price: 10000, category: "Topping", emoji: "🧀" },
];

export const CATEGORIES = ["Tất cả", "Trà sữa", "Trà trái cây", "Topping"];

// Convert DB row to Transaction
function rowToTransaction(row: any): Transaction {
  const items = row.items as CartItem[] | null;
  return {
    id: row.id,
    type: row.type as "income" | "expense",
    items: items ?? undefined,
    amount: row.amount,
    description: row.description,
    date: row.created_at,
    paymentReceived: row.payment_received ?? undefined,
    changeGiven: row.change_given ?? undefined,
    orderStatus: (row.order_status as OrderStatus) ?? undefined,
  };
}

export function useAppState() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions from DB
  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data.map(rowToTransaction));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(
    async (txn: Omit<Transaction, "id" | "date">) => {
      if (!user) return;

      const orderStatus =
        txn.type === "income" && txn.items && txn.items.length > 0
          ? "pending"
          : undefined;

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: txn.type,
          items: (txn.items as unknown as Json) ?? null,
          amount: txn.amount,
          description: txn.description,
          payment_received: txn.paymentReceived ?? null,
          change_given: txn.changeGiven ?? null,
          order_status: orderStatus ?? null,
        })
        .select()
        .single();

      if (!error && data) {
        setTransactions((prev) => [rowToTransaction(data), ...prev]);
      }
    },
    [user]
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const { error } = await supabase
        .from("transactions")
        .update({ order_status: status })
        .eq("id", id);

      if (!error) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? { ...t, orderStatus: status } : t))
        );
      }
    },
    []
  );

  return { transactions, addTransaction, updateOrderStatus, loading };
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}
