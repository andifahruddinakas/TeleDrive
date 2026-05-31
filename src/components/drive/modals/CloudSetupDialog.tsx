import React from "react";
import { Bot, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import { 
  Dialog, DialogContent, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CloudSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botUsername: string | null;
  tgToken: string;
  setTgToken: (val: string) => void;
  updateTelegramSettings: () => void;
  profileLoading: boolean;
  setBotUsername: (val: string | null) => void;
  loadProfile: () => void;
}

export const CloudSetupDialog: React.FC<CloudSetupDialogProps> = ({
  open,
  onOpenChange,
  botUsername,
  tgToken,
  setTgToken,
  updateTelegramSettings,
  profileLoading,
  setBotUsername,
  loadProfile
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-[95vw] sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-white text-center">Hubungkan Bot</DialogTitle>
              <p className="text-white/80 text-sm text-center">Simpan file dengan Bot Cloud pribadi Anda</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {!botUsername ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Langkah 1: Masukkan Token</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dapatkan API Token dari <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">@BotFather <ExternalLink className="w-3 h-3" /></a> dan tempelkan di bawah:
                </p>
              </div>

              <div className="space-y-1.5">
                <Input
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  placeholder="Contoh: 123456789:ABCdef..."
                  className="h-12 rounded-lg bg-secondary/50 border-border/40 focus:ring-primary focus:border-primary font-mono text-sm"
                />
              </div>

              <Button
                onClick={updateTelegramSettings}
                disabled={profileLoading || !tgToken}
                className="w-full h-12 rounded-lg shadow-elegant bg-primary hover:bg-primary/90 font-bold"
              >
                {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verifikasi Bot"}
              </Button>
            </div>
          ) : (
            <div className="space-y-5 animate-in zoom-in-95 duration-300">
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg">Langkah Terakhir</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bot <b>@{botUsername}</b> berhasil diverifikasi. Sekarang Anda perlu memasukkannya ke grup penyimpanan.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://t.me/${botUsername}?startgroup=storage&admin=post_messages+edit_messages+delete_messages`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-14 rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Hubungkan ke Grup <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-[11px] text-center text-muted-foreground italic">
                  *Pilih grup "TeleDrive Storage" atau grup yang sesuai setelah klik tombol di atas.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => { onOpenChange(false); setBotUsername(null); loadProfile(); }}
                className="w-full h-12 rounded-lg border-dashed font-bold"
              >
                Saya Sudah Menghubungkannya
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
