import { useState, useCallback } from "react";

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

export function useAppState() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("tea-transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const saveTransactions = useCallback((txns: Transaction[]) => {
    setTransactions(txns);
    localStorage.setItem("tea-transactions", JSON.stringify(txns));
  }, []);

  const addTransaction = useCallback((txn: Omit<Transaction, "id" | "date">) => {
    const newTxn: Transaction = {
      ...txn,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => {
      const updated = [newTxn, ...prev];
      localStorage.setItem("tea-transactions", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { transactions, addTransaction, saveTransactions };
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}
