import React from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | null;
}

export const NotificationDialog: React.FC<NotificationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  variant = "default"
}) => {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4 animate-in zoom-in duration-300" />;
      case "destructive":
        return <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-in zoom-in duration-300" />;
      default:
        return <Info className="w-12 h-12 text-primary mb-4 animate-in zoom-in duration-300" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-[400px] rounded-lg p-6 border-none shadow-2xl flex flex-col items-center text-center">
        <DialogHeader className="flex flex-col items-center">
          {getIcon()}
          <DialogTitle className="text-xl font-bold mb-2">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-row justify-center sm:justify-center items-center">
          <Button 
            onClick={() => onOpenChange(false)} 
            size="sm"
            className="w-fit px-10 h-10 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
