import React from "react";
import { Home, Cloud, Star, Trash2, Database } from "lucide-react";

interface CategoryNavProps {
  view: string;
  activeFilter: string;
  setView: (val: any) => void;
  setActiveFilter: (val: string) => void;
  setCurrentFolder: (val: any) => void;
  setTrail: (val: any[]) => void;
  clearSelection: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  view,
  activeFilter,
  setView,
  setActiveFilter,
  setCurrentFolder,
  setTrail,
  clearSelection
}) => {
  const categories = [
    { id: "home", label: "Beranda", icon: Home },
    { id: "drive", label: "Penyimpanan", icon: Cloud },
    { id: "starred", label: "Berbintang", icon: Star },
    { id: "trash", label: "Sampah", icon: Trash2 },
    { id: "storage", label: "Kapasitas", icon: Database },
  ];

  return (
    <nav className="lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:z-0 lg:bg-transparent lg:border-t-0 lg:shadow-none lg:h-auto fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/40 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] h-16 pt-1 pb-2" translate="no">
      <div className="flex items-center justify-around lg:justify-start lg:gap-2 lg:flex-col lg:items-stretch h-full lg:h-auto max-w-lg lg:max-w-none mx-auto lg:mx-0 px-4 lg:px-0">
        <p className="hidden lg:block text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4 mb-2 mt-4">Kategori</p>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = view === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                clearSelection();
                setView(cat.id as any);
                if (cat.id === "drive") {
                  setActiveFilter("all");
                  setCurrentFolder(null);
                  setTrail([]);
                }
              }}
              className={`flex items-center gap-3 h-12 lg:h-11 rounded-lg transition-all relative px-4 ${isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
            >
              <Icon className={`w-5 h-5 transition-all ${isActive ? "scale-110" : "scale-100"}`} />
              <span className={`text-sm font-bold tracking-tight whitespace-nowrap transition-all ${isActive ? "block" : "hidden lg:block"}`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
