import React from "react";
import { FolderPlus } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (val: string) => void;
  createFolder: () => void;
}

export const NewFolderDialog: React.FC<NewFolderDialogProps> = ({
  open,
  onOpenChange,
  newFolderName,
  setNewFolderName,
  createFolder
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] sm:max-w-[400px] rounded-lg p-6">
        <div className="flex flex-col items-center text-center pt-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <FolderPlus className="w-8 h-8 text-emerald-600" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl text-center">Folder Baru</DialogTitle>
          </DialogHeader>
        </div>
        <div className="py-4">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Masukkan nama folder..."
            autoFocus
            className="h-12 rounded-xl text-center"
            onKeyDown={(e) => e.key === "Enter" && createFolder()}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button onClick={() => onOpenChange(false)} className="rounded-lg h-11 font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadow-none">Batal</Button>
          <Button variant="hero" onClick={createFolder} className="rounded-lg h-11 font-bold">Buat</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
