import React from "react";
import { Clock, Database, Cloud, Zap, ArrowRight, User as UserIcon } from "lucide-react";
import { StorageStats } from "../StorageStats";

interface HomeViewProps {
  profileName: string | null;
  user: any;
  recentFiles: any[];
  formatBytes: (bytes: number) => string;
  openFile: (file: any) => void;
  stats: any;
  totalSize: number;
  STORAGE_LIMIT: number;
  notify: (payload: any) => void;
  setView: (view: any) => void;
  search?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profileName,
  user,
  recentFiles,
  formatBytes,
  openFile,
  stats,
  totalSize,
  STORAGE_LIMIT,
  notify,
  setView,
  search
}) => {
  const greetingText = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  }, []);

  return (
    <div id="home-view-container" className="space-y-8 pb-8" translate="no">
      {/* Welcome Hero Section - Shrunk and Rounded-LG */}
      <section id="hero-section" className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary via-primary/90 to-blue-700 p-6 text-white shadow-xl shadow-primary/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-2xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 grid place-items-center shadow-inner shrink-0">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 id="home-greeting" className="text-2xl font-black tracking-tight mb-1">
              {`${greetingText}, ${profileName || user?.email?.split('@')[0]}!`}
            </h2>
            <p id="home-subtext" className="text-white/80 font-medium text-sm max-w-xl">
              {recentFiles.length > 0 ? `Siap untuk mengelola data Anda hari ini? Ada ${recentFiles.length} aktivitas terbaru.` : "Mulai unggah file pertama Anda."}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView("drive")} className="bg-white text-primary px-5 py-2.5 rounded-lg font-bold text-xs shadow-xl shadow-black/10 hover:bg-zinc-50 hover:-translate-y-1 transition-all active:translate-y-0 flex items-center gap-2 uppercase tracking-wider">
              Eksplorasi <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Recent Files Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 grid place-items-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground tracking-tight">
                  {search?.trim() ? "Hasil Pencarian" : "Aktivitas Terbaru"}
                </h3>
              </div>
            </div>
            <button onClick={() => setView("drive")} className="text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all">
              {search?.trim() ? "Lihat Semua" : "Semua File"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {recentFiles.length > 0 ? recentFiles.map(file => (
              <div
                key={file.id}
                onClick={() => openFile(file)}
                className="bg-card p-3 rounded-lg border border-border/60 flex items-center gap-4 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group hover:-translate-x-1 hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary/30 border border-border/40 flex items-center justify-center group-hover:bg-primary/5 transition-colors shrink-0 overflow-hidden shadow-inner">
                  {file.thumbnail_data_url ? (
                    <img src={file.thumbnail_data_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-6 h-6 text-primary/40 flex items-center justify-center">
                      <Cloud className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{formatBytes(file.size)} • {new Date(file.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-secondary/50 opacity-0 group-hover:opacity-100 grid place-items-center transition-all">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </div>
            )) : (
              <div className="bg-card border border-border/60 rounded-lg py-12 flex flex-col items-center justify-center text-center px-6 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-secondary/50 grid place-items-center mb-4">
                  <Cloud className="w-7 h-7 text-muted-foreground" />
                </div>
                <h4 className="text-md font-bold text-foreground mb-1">Penyimpanan Kosong</h4>
                <p className="text-xs text-muted-foreground font-medium max-w-[200px]">Mulai unggah file Anda untuk melihat aktivitas di sini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Capacity Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 grid place-items-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground tracking-tight">Kapasitas Cloud</h3>
              </div>
            </div>
            <button onClick={() => setView("storage")} className="text-xs font-bold text-orange-600 bg-orange-500/5 px-3 py-1.5 rounded-lg hover:bg-orange-500/10 transition-all">Detail</button>
          </div>

          <div className="bg-card rounded-lg p-2 border border-border/60 shadow-sm">
            <StorageStats stats={stats} totalSize={totalSize} STORAGE_LIMIT={STORAGE_LIMIT} formatBytes={formatBytes} notify={notify} />
          </div>
        </div>
      </div>
    </div>
  );
};
