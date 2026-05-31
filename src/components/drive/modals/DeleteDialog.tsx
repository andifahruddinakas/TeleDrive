import React from "react";
import { AlertTriangle } from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "file" | "folder" | null;
  targetName: string;
  handleDelete: () => void;
  isTrash: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onOpenChange,
  type,
  targetName,
  handleDelete,
  isTrash
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-[90vw] sm:max-w-[400px]">
        <div className="flex flex-col items-center text-center pt-4">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-2xl font-bold text-center">
              {type === "file" ? "Hapus File?" : "Hapus Folder?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-center">
              {isTrash 
                ? `${type === "file" ? 'File' : 'Folder'} "${targetName}" akan dihapus secara permanen.`
                : `${type === "file" ? 'File' : 'Folder'} "${targetName}" akan dipindahkan ke sampah.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="grid grid-cols-2 gap-3 mt-6">
          <AlertDialogCancel asChild>
            <Button onClick={() => onOpenChange(false)} className="rounded-lg h-11 font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadow-none">Batal</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete} className="rounded-lg h-11 font-bold">
              {isTrash ? "Hapus" : "Ya, Hapus"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
