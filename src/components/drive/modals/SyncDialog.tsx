import React from "react";
import { RefreshCcw, Image as ImageIcon, Zap, Loader2 } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSyncing: boolean;
  localMedia: any[];
  startBatchSync: () => void;
}

export const SyncDialog: React.FC<SyncDialogProps> = ({
  open,
  onOpenChange,
  isSyncing,
  localMedia,
  startBatchSync
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="w-16 h-16 rounded-3xl bg-primary text-white grid place-items-center mb-6 shadow-elegant-primary animate-bounce-slow">
            <RefreshCcw className={`w-8 h-8 ${isSyncing ? 'animate-spin' : ''}`} />
          </div>
          <DialogHeader className="text-left p-0">
            <DialogTitle className="text-2xl font-black text-slate-800">Auto-Sync Galeri</DialogTitle>
            <p className="text-sm text-muted-foreground font-medium">Cadangkan foto & video dari HP Anda secara otomatis ke Telegram Cloud.</p>
          </DialogHeader>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">{localMedia.length} Media Baru</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ditemukan di Galeri</p>
              </div>
            </div>
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Status Sinkronisasi</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase">Siap Dicadangkan</span>
            </div>
            <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
              <div className={`h-full bg-primary transition-all duration-500 ${isSyncing ? 'animate-pulse' : ''}`} style={{ width: isSyncing ? '60%' : '0%' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              className="rounded-lg h-12 font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadow-none"
            >
              Batal
            </Button>
            <Button
              variant="hero"
              onClick={startBatchSync}
              disabled={isSyncing || localMedia.length === 0}
              className="rounded-lg h-12 font-bold shadow-sm group relative overflow-hidden"
            >
              <span className="relative flex items-center justify-center gap-2">
                {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isSyncing ? "Proses..." : "Cadangkan"}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
