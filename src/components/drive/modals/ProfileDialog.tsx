import React from "react";
import { User as UserIcon, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string | null;
  setProfileName: (val: string) => void;
  profileAvatar: string | null;
  setProfileAvatar: (val: string) => void;
  updateProfile: () => void;
  profileLoading: boolean;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({
  open,
  onOpenChange,
  profileName,
  setProfileName,
  profileAvatar,
  setProfileAvatar,
  updateProfile,
  profileLoading
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-[90vw] sm:max-w-[400px]">
        <div className="flex flex-col items-center text-center pt-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserIcon className="w-8 h-8 text-primary" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl text-center">Profil</DialogTitle>
          </DialogHeader>
        </div>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase pl-1 text-center block w-full">Nama</label>
            <Input
              value={profileName || ""}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Nama Anda"
              className="h-12 rounded-xl text-center"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button onClick={() => onOpenChange(false)} className="rounded-lg h-11 font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadow-none">Batal</Button>
          <Button variant="hero" onClick={updateProfile} disabled={profileLoading} className="rounded-lg h-11 font-bold">
            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
