import React from "react";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renameValue: string;
  setRenameValue: (val: string) => void;
  handleRename: () => void;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  open,
  onOpenChange,
  renameValue,
  setRenameValue,
  handleRename
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-[90vw] sm:max-w-[400px]">
        <div className="flex flex-col items-center text-center pt-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Pencil className="w-8 h-8 text-primary" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl text-center">Ubah Nama</DialogTitle>
          </DialogHeader>
        </div>
        <div className="py-4">
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
            className="h-12 rounded-xl text-center font-bold"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button onClick={() => onOpenChange(false)} className="rounded-lg h-11 font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadow-none">Batal</Button>
          <Button variant="hero" onClick={handleRename} className="rounded-lg h-11 font-bold">Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
