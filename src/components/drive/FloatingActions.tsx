import React from "react";
import { motion } from "framer-motion";
import { Plus, Upload, FolderPlus } from "lucide-react";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface FloatingActionsProps {
  actionsOpen: boolean;
  setActionsOpen: (val: boolean) => void;
  isConnected: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  cameraInputRef: React.RefObject<HTMLInputElement>;
  setNewFolderOpen: (val: boolean) => void;
  uploads: Record<string, any>;
  setUploadDialogOpen: (val: boolean) => void;
  selectedIds: Set<string>;
  setSelectedIds: (val: Set<string>) => void;
  setMoveTarget: (val: any) => void;
  setMoveDialogOpen: (val: boolean) => void;
  setDeleteDialog: (val: any) => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  actionsOpen,
  setActionsOpen,
  isConnected,
  fileInputRef,
  cameraInputRef,
  setNewFolderOpen,
  uploads,
  setUploadDialogOpen,
  selectedIds,
  setSelectedIds,
  setMoveTarget,
  setMoveDialogOpen,
  setDeleteDialog
}) => {
  const constraintsRef = React.useRef(null);
  
  return (
    <>
      <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-[25]" />
      
      {/* Upload Mini Status */}
      {Object.keys(uploads).length > 0 && (
        <button
          onClick={() => setUploadDialogOpen(true)}
          className="fixed bottom-24 right-6 z-30 flex items-center gap-3 bg-card/80 backdrop-blur-xl border border-border/40 p-2 pl-4 rounded-2xl shadow-elegant animate-in slide-in-from-right-8 duration-300 group hover:bg-card transition-all mb-20"
        >
          <div className="flex flex-col items-end">
            <p className="text-[11px] font-bold leading-tight">{Object.keys(uploads).length} File Mengunggah</p>
            <p className="text-[9px] text-muted-foreground font-medium">Tap untuk detail</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 w-full bg-primary/20 transition-all duration-500"
              style={{ height: `${Math.max(...Object.values(uploads).map(u => u.pct))}%` }}
            />
            <Upload className="w-4 h-4 text-primary animate-bounce" />
          </div>
        </button>
      )}
 
      {/* Floating Action Button */}
      <motion.button
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setActionsOpen(true)}
        className="fixed bottom-24 right-6 z-30 w-14 h-14 rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant grid place-items-center hover:shadow-xl sm:mb-0 cursor-grab active:cursor-grabbing pointer-events-auto"
        aria-label="Aksi"
      >
        <Plus className="w-6 h-6" />
      </motion.button>


      {/* Action sheet (mobile bottom sheet) */}
      <Sheet open={actionsOpen} onOpenChange={setActionsOpen}>
        <SheetContent side="bottom" className="rounded-t-lg pb-8">
          <SheetHeader className="mb-2">
            <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30 mb-3" />
            <SheetTitle className="text-left">Tambah Baru</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-1 gap-2">
            <button
              disabled={!isConnected}
              onClick={() => { setActionsOpen(false); fileInputRef.current?.click(); }}
              className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-secondary active:bg-secondary/80 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 grid place-items-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Unggah File</p>
                <p className="text-xs text-muted-foreground">
                  {!isConnected ? "Hubungkan bot terlebih dahulu" : "Pilih file dari perangkat"}
                </p>
              </div>
            </button>
 
            <button
              onClick={() => { setActionsOpen(false); setNewFolderOpen(true); }}
              data-new-folder-trigger
              className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-secondary active:bg-secondary/80 transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 grid place-items-center">
                <FolderPlus className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Folder Baru</p>
                <p className="text-xs text-muted-foreground">Buat folder untuk mengelompokkan</p>
              </div>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
