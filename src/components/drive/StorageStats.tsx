import React from "react";
import { Zap, PieChart } from "lucide-react";

import { StorageStats as StorageStatsType } from "@/types/drive";

interface StorageStatsProps {
  totalSize: number;
  STORAGE_LIMIT: number;
  stats: StorageStatsType;
  formatBytes: (bytes: number) => string;
  notify: (payload: any) => void;
}

export const StorageStats: React.FC<StorageStatsProps> = ({ 
  totalSize, 
  STORAGE_LIMIT, 
  stats, 
  formatBytes 
}) => {
  const percentage = Math.min(100, (totalSize / STORAGE_LIMIT) * 100);
  
  const categories = [
    { label: "Gambar", size: stats.image, color: "bg-emerald-500", shadow: "shadow-emerald-500/20" },
    { label: "Video", size: stats.video, color: "bg-rose-500", shadow: "shadow-rose-500/20" },
    { label: "Audio", size: stats.audio, color: "bg-violet-500", shadow: "shadow-violet-500/20" },
    { label: "Dokumen", size: stats.document, color: "bg-amber-500", shadow: "shadow-amber-500/20" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Terpakai</p>
            <h4 className="text-3xl font-black tracking-tighter text-foreground">{`${Math.round(percentage)}%`}</h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">Kapasitas Sisa</p>
            <p className="text-xs font-bold text-muted-foreground">{formatBytes(STORAGE_LIMIT - totalSize)}</p>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="relative h-4 w-full bg-secondary/50 rounded-full overflow-hidden flex shadow-inner border border-border/40">
          {categories.map((cat, i) => {
            const catPercentage = (cat.size / STORAGE_LIMIT) * 100;
            if (catPercentage < 0.5) return null;
            return (
              <div 
                key={i}
                className={`h-full ${cat.color} transition-all duration-1000 ease-out border-r border-white/20 last:border-0`}
                style={{ width: `${catPercentage}%` }}
              />
            );
          })}
          {/* Remaining used space (unclassified) */}
          {percentage > categories.reduce((acc, c) => acc + (c.size / STORAGE_LIMIT) * 100, 0) && (
             <div 
               className="h-full bg-zinc-400 transition-all duration-1000 ease-out"
               style={{ width: `${percentage - categories.reduce((acc, c) => acc + (c.size / STORAGE_LIMIT) * 100, 0)}%` }}
             />
          )}
        </div>
        
        <div className="flex justify-between items-center pt-1">
          <p className="text-[11px] font-bold text-muted-foreground">{formatBytes(totalSize)} Terpakai</p>
          <p className="text-[11px] font-bold text-muted-foreground">{formatBytes(STORAGE_LIMIT)} Total</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat.label} className="p-2.5 rounded-lg bg-secondary/30 border border-border/40 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${cat.color} ${cat.shadow} group-hover:scale-125 transition-transform`} />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{cat.label}</span>
            </div>
            <p className="text-xs font-bold text-foreground ml-4">{formatBytes(cat.size)}</p>
          </div>
        ))}
      </div>

      <div className="pt-1">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 grid place-items-center shrink-0">
            <PieChart className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-primary mb-0.5">Analisis Pintar</p>
            <p className="text-[10px] text-primary/60 font-medium leading-tight">Gunakan fitur pembersihan otomatis untuk mengoptimalkan cloud.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
