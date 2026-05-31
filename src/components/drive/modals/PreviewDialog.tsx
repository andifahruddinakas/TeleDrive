import React from "react";
import { Download, Music, FileIcon as FileIconLucide } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Re-using FileIcon logic or passing as prop
import { FileIcon } from "../FileIcon";

interface PreviewDialogProps {
  file: any;
  url: string | null;
  onOpenChange: (open: boolean) => void;
  textContent: string | null;
  handleDownload: (f: any) => void;
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({
  file,
  url,
  onOpenChange,
  textContent,
  handleDownload
}) => {
  const close = () => {
    onOpenChange(false);
  };

  return (
    <Dialog key="dialog-preview" open={!!file} onOpenChange={(o) => !o && close()}>
      <DialogContent className="w-[92vw] sm:max-w-2xl rounded-lg p-0 overflow-hidden border-none shadow-elegant bg-white flex flex-col gap-0 translate-x-[-50%] translate-y-[-50%]">
        <div className="p-7 border-b border-border/40">
          <DialogTitle className="text-sm font-black truncate pr-12 text-slate-800">
            {file?.name}
          </DialogTitle>
        </div>

        <div className="bg-slate-50/50 flex-1 flex items-center justify-center min-h-[45vh] max-h-[65vh] relative p-6 overflow-hidden">
          {!url ? (
            <div className="flex flex-col items-center gap-5">
              <div className="w-14 h-14 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <p className="text-[11px] font-black text-muted-foreground animate-pulse tracking-[0.2em] uppercase">Memuat Pratinjau</p>
            </div>
          ) :
            file?.mime_type?.startsWith("image/") ? (
              <img src={url} alt={file.name} className="max-w-full max-h-full object-contain shadow-md rounded-lg" />
            ) : file?.mime_type?.startsWith("video/") ? (
              <video src={url} controls className="max-w-full max-h-full bg-black rounded-lg" autoPlay />
            ) : file?.mime_type?.startsWith("audio/") ? (
              <div className="flex flex-col items-center gap-6 w-full max-w-sm p-8 bg-white rounded-3xl shadow-card border border-border/40">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Music className="w-12 h-12 text-primary" />
                </div>
                <div className="w-full">
                  <audio src={url} controls className="w-full" autoPlay />
                </div>
                <p className="text-xs text-muted-foreground font-medium truncate w-full text-center">{file?.name}</p>
              </div>
            ) : file?.mime_type === "application/pdf" ? (
              <iframe src={url} className="w-full h-full min-h-[55vh] rounded-lg border border-border/40" title={file.name} />
            ) : file?.name.match(/\.(md|json|js|ts|txt)$/) || file?.mime_type?.startsWith("text/") ? (
              <div className="w-full h-full min-h-[50vh] bg-secondary/30 p-4 rounded-xl overflow-auto border border-border/40 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-text">
                {textContent || "Memuat konten..."}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-12">
                <FileIcon mime={file?.mime_type} className="w-20 h-20 text-muted-foreground opacity-20" />
                <p className="text-sm text-muted-foreground font-medium">Preview tidak tersedia untuk format ini.</p>
              </div>
            )}
        </div>

        <div className="p-7 bg-white border-t border-border/40">
          <Button
            variant="hero"
            onClick={() => file && handleDownload(file)}
            className="w-full h-16 rounded-lg shadow-elegant-primary font-black text-base flex items-center justify-center gap-3"
          >
            <Download className="w-6 h-6" />
            <span>Unduh File</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
