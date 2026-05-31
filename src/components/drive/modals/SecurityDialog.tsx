import React from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SecurityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notify: (payload: any) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  updatePassword: () => void;
  profileLoading: boolean;
}

export const SecurityDialog: React.FC<SecurityDialogProps> = ({
  open,
  onOpenChange,
  notify,
  showPassword,
  setShowPassword,
  newPassword,
  setNewPassword,
  updatePassword,
  profileLoading
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-[90vw] sm:max-w-[400px]">
        <div className="flex flex-col items-center text-center pt-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl text-center">Keamanan</DialogTitle>
          </DialogHeader>
        </div>
        <div className="space-y-4 py-4">

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase pl-1 text-center block w-full">Password Baru</label>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="h-12 rounded-xl text-center pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button onClick={() => onOpenChange(false)} className="rounded-lg h-11 font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadow-none">Batal</Button>
          <Button variant="hero" onClick={updatePassword} disabled={profileLoading} className="rounded-lg h-11 font-bold bg-amber-600 hover:bg-amber-700">
            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
