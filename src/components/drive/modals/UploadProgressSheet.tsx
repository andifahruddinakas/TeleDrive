import React from "react";
import { 
  Upload, CheckCircle2, AlertCircle, FileText, RefreshCcw, X, 
  Check, Loader2 
} from "lucide-react";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadProgressSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploads: Record<string, any>;
  formatBytes: (bytes: number) => string;
  handleReupload: (id: string) => void;
  cancelUpload: (id: string) => void;
  setUploads: (val: any) => void;
}

export const UploadProgressSheet: React.FC<UploadProgressSheetProps> = ({
  open,
  onOpenChange,
  uploads,
  formatBytes,
  handleReupload,
  cancelUpload,
  setUploads
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg h-[80vh] sm:h-[75vh] p-0 overflow-hidden flex flex-col">
        <div className="p-6 pb-4 border-b border-border/40">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              Progres Unggahan
            </SheetTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Sedang mengunggah {Object.keys(uploads).length} file ke Cloud
            </p>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(uploads).map(([id, u]) => (
            <div key={id} className={`bg-secondary/20 rounded-lg p-4 border transition-all ${u.status === 'error' ? 'border-destructive/30 bg-destructive/5' : 'border-border/40'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
                  u.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 
                  u.status === 'error' ? 'bg-rose-500/10 text-rose-600' : 'bg-primary/10 text-primary'
                }`}>
                  {u.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
                   u.status === 'error' ? <AlertCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{u.name}</p>
                  <div className="flex justify-between items-center mt-0.5">
                    {u.status === 'error' ? (
                      <p className="text-[10px] text-rose-600 font-medium truncate">{u.error || 'Gagal mengunggah'}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(((u.pct || 0) / 100) * (u.size || 0))} dari {formatBytes(u.size || 0)}
                      </p>
                    )}
                    <p className={`text-xs font-bold ${u.status === 'success' ? 'text-emerald-600' : u.status === 'error' ? 'text-rose-600' : 'text-primary'}`}>
                      {u.status === 'success' ? 'Selesai' : u.status === 'error' ? 'Gagal' : `${u.pct}%`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {u.status === 'error' && (
                    <Button size="icon" variant="ghost" onClick={() => handleReupload(id)} className="w-8 h-8 rounded-lg text-primary hover:bg-primary/10">
                      <RefreshCcw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => cancelUpload(id)} className="w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {u.status === 'uploading' && <Progress value={u.pct} className="h-2 rounded-full" />}
            </div>
          ))}
          {Object.keys(uploads).length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Antrean unggahan kosong</p>
              <Button onClick={() => onOpenChange(false)} variant="outline" className="mt-4 rounded-lg px-8 font-bold">Tutup</Button>
            </div>
          )}
          {Object.values(uploads).some(u => u.status === 'success') && !Object.values(uploads).some(u => u.status === 'uploading') && (
            <div className="pt-2">
              <Button 
                onClick={() => {
                  const next = { ...uploads };
                  Object.keys(next).forEach(id => {
                    if (next[id].status === 'success') delete next[id];
                  });
                  setUploads(next);
                }} 
                variant="secondary" 
                className="w-full rounded-lg h-12 font-bold"
              >
                Bersihkan yang Berhasil
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
