import { MenuItem, MENU_ITEMS, CATEGORIES, formatVND } from "@/lib/store";
import { useState } from "react";

interface MenuGridProps {
  onAddItem: (item: MenuItem) => void;
}

export default function MenuGrid({ onAddItem }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filtered = activeCategory === "Tất cả"
    ? MENU_ITEMS
    : MENU_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => onAddItem(item)}
            className="glass-card rounded-xl p-4 text-left hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 animate-pop-in group"
          >
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{item.emoji}</span>
            <p className="font-bold text-sm text-foreground leading-tight">{item.name}</p>
            <p className="text-primary font-extrabold mt-1">{formatVND(item.price)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
