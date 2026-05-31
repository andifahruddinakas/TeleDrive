import React from "react";
import { Cloud } from "lucide-react";

interface KapasitasViewProps {
  totalSize: number;
  STORAGE_LIMIT: number;
  stats: any;
  formatBytes: (bytes: number) => string;
  notify?: (p: any) => void;
  tgSetupOpen?: boolean;
  setTgSetupOpen?: (v: boolean) => void;
  tgToken?: string;
  setTgToken?: (v: string) => void;
  botUsername?: string;
  setBotUsername?: (v: string) => void;
  updateTelegramSettings?: () => void;
  profileLoading?: boolean;
}

export const KapasitasView: React.FC<KapasitasViewProps> = ({
  totalSize,
  STORAGE_LIMIT,
  stats,
  formatBytes,
  notify,
  tgSetupOpen,
  setTgSetupOpen,
  tgToken,
  setTgToken,
  botUsername,
  setBotUsername,
  updateTelegramSettings,
  profileLoading
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-border/40 shadow-sm space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Digunakan</p>
              <p className="text-3xl font-black text-primary leading-none">{Math.round((totalSize / STORAGE_LIMIT) * 100)}%</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-foreground leading-none">{formatBytes(totalSize)}</p>
              <p className="text-[11px] font-bold text-muted-foreground mt-1">dari {formatBytes(STORAGE_LIMIT)}</p>
            </div>
          </div>
          <div className="h-3 bg-secondary rounded-lg overflow-hidden flex shadow-inner border border-border/20">
            <div className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(32,160,255,0.4)]" style={{ width: `${(totalSize / STORAGE_LIMIT) * 100}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {Object.entries(stats).map(([key, size]: [string, any]) => (
            <div key={key} className="p-4 rounded-lg bg-secondary/30 border border-border/40 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  {key === 'image' && <Cloud className="w-4 h-4 text-blue-500" />}
                  {key === 'video' && <Cloud className="w-4 h-4 text-purple-500" />}
                  {key === 'audio' && <Cloud className="w-4 h-4 text-pink-500" />}
                  {key === 'document' && <Cloud className="w-4 h-4 text-orange-500" />}
                  {key === 'archive' && <Cloud className="w-4 h-4 text-emerald-500" />}
                  {key === 'other' && <Cloud className="w-4 h-4 text-slate-500" />}
                </div>
                <p className="font-black text-xs capitalize tracking-tight">{key}</p>
              </div>
              <p className="text-md font-black">{formatBytes(size)}</p>
              <div className="w-full h-1.5 bg-white/50 rounded-lg mt-2 overflow-hidden">
                <div className="h-full bg-primary/40" style={{ width: `${(size / totalSize) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
