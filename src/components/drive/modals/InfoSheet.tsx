import { Folder } from "lucide-react";
import { FileIcon, fileIconColor } from "../FileIcon";
import { 
  Sheet, SheetContent 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Note: Folder and FileIcon are from our new FileIcon component.
// But in Drive.tsx it used FileIcon from our new component if we imported it there.
// I'll import from the sibling.

interface InfoSheetProps {
  infoItem: any;
  onOpenChange: (open: boolean) => void;
  formatBytes: (bytes: number) => string;
}

export const InfoSheet: React.FC<InfoSheetProps> = ({
  infoItem,
  onOpenChange,
  formatBytes
}) => {
  return (
    <Sheet open={!!infoItem} onOpenChange={(o) => !o && onOpenChange(false)}>
      <SheetContent side="right" className="w-[85vw] sm:max-w-md p-0 overflow-hidden">
        <div className="h-32 bg-gradient-primary relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-3xl bg-card border-4 border-background shadow-xl grid place-items-center">
              {infoItem?.kind === 'folder' ? (
                <Folder className="w-10 h-10 text-primary fill-primary/10" />
              ) : (
                <FileIcon mime={infoItem?.data.mime_type} className={`w-10 h-10 ${fileIconColor(infoItem?.data.mime_type).split(" ")[0]}`} />
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-14 px-6 space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl font-black truncate">{infoItem?.data.name}</h2>
            <p className="text-xs text-muted-foreground font-medium">{infoItem?.kind === 'folder' ? 'Folder' : (infoItem?.data.mime_type || 'Unknown Type')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/40 space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ukuran</p>
              <p className="text-sm font-bold">{infoItem?.kind === 'folder' ? '-' : formatBytes(infoItem?.data.size || 0)}</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/40 space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dibuat Pada</p>
              <p className="text-sm font-bold">{new Date(infoItem?.data.created_at).toLocaleString("id-ID", { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
            {infoItem?.kind === 'file' && (
              <div className="p-4 bg-secondary/30 rounded-2xl border border-border/40 space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status Berbagi</p>
                <p className="text-sm font-bold">{infoItem.data.is_public ? 'Publik' : 'Privat'}</p>
              </div>
            )}
          </div>

          <div className="pt-4 space-y-3">
            <Button onClick={() => onOpenChange(false)} className="w-full h-12 rounded-xl font-bold">Tutup</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
