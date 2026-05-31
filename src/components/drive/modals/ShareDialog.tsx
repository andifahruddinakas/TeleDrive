import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink as ShareIcon, FileText as FileIcon, Lock as LockIcon, Copy as CopyIcon,
  Check as CheckIcon, Loader2 as LoaderIcon, Save as SaveIcon,
  X as CloseIcon, Globe as GlobeIcon, Lock as RestrictedIcon, ChevronDown as ChevronIcon,
  Link as LinkIcon, UserPlus as AddUserIcon
} from "lucide-react";

interface ShareDialogProps {
  shareDialogOpen: boolean;
  setShareDialogOpen: (val: boolean) => void;
  shareFile: any;
  formatBytes: (bytes: number) => string;
  localIsPublic: boolean;
  setLocalIsPublic: (val: boolean) => void;
  shareLoading: boolean;
  shareUserSearch: string;
  setShareUserSearch: (val: string) => void;
  searchUsers: (query: string) => void;
  searchingUsers: boolean;
  foundUsers: any[];
  fileShares: any[];
  notify: (payload: any) => void;
  BASE_URL: string;
  onSave: (pendingShares: any[], pendingRemovals: string[]) => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  shareDialogOpen,
  setShareDialogOpen,
  shareFile,
  formatBytes,
  localIsPublic,
  setLocalIsPublic,
  shareLoading,
  shareUserSearch,
  setShareUserSearch,
  searchUsers,
  searchingUsers,
  foundUsers,
  fileShares,
  notify,
  BASE_URL,
  onSave
}) => {
  const [copied, setCopied] = useState(false);
  const [pendingShares, setPendingShares] = useState<any[]>([]);
  const [pendingRemovals, setPendingRemovals] = useState<string[]>([]);
  const [displayShares, setDisplayShares] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shareDialogOpen) {
      setDisplayShares(fileShares);
      setPendingShares([]);
      setPendingRemovals([]);
      setShareUserSearch("");
    }
  }, [shareDialogOpen, fileShares]);

  const handleAddPendingShare = (targetUser: any) => {
    const exists = displayShares.some(s => s.shared_with === targetUser.user_id) ||
      pendingShares.some(u => u.user_id === targetUser.user_id);
    if (exists) {
      notify({ title: "Sudah ada", description: "Pengguna ini sudah masuk daftar." });
      return;
    }
    setPendingShares([...pendingShares, targetUser]);
    setShareUserSearch("");
    searchInputRef.current?.focus();
  };

  const handleRemoveShare = (shareId: string, userId: string) => {
    if (shareId) {
      setPendingRemovals([...pendingRemovals, shareId]);
      setDisplayShares(displayShares.filter(s => s.id !== shareId));
    } else {
      setPendingShares(pendingShares.filter(u => u.user_id !== userId));
    }
  };

  const handleCopy = () => {
    const url = `${BASE_URL}/share/${shareFile?.id}`;
    const onSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(onSuccess).catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        onSuccess();
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      
      // Select the text
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile
      
      try {
        const successful = document.execCommand("copy");
        if (successful) onSuccess();
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Dialog key="dialog-share" open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
      <DialogContent className="max-w-[95vw] sm:max-w-[440px] rounded-lg p-0 overflow-hidden border-none shadow-2xl bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-base font-bold">
              <div className="w-9 h-9 rounded-lg bg-blue-50 grid place-items-center shrink-0">
                <ShareIcon className="w-5 h-5 text-blue-600" />
              </div>
              Bagikan File
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {/* File Info Card */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-50 grid place-items-center shrink-0">
              <FileIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{shareFile?.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{formatBytes(shareFile?.size ?? 0)}</p>
            </div>
          </div>

          {/* Recipient Input Area */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 ml-1">Tambahkan orang</label>
            <div className={cn(
              "min-h-[48px] p-2 bg-white border border-slate-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all flex flex-wrap gap-2 items-center",
              searchingUsers && "opacity-80"
            )}>
              {pendingShares.map(u => (
                <div key={u.user_id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 pl-1 pr-1.5 py-1 rounded-full border border-blue-100 animate-in zoom-in-95 duration-200">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white grid place-items-center text-[8px] font-bold">
                    {u.display_name?.slice(0, 1).toUpperCase() || "U"}
                  </div>
                  <span className="text-[11px] font-bold truncate max-w-[100px]">{u.display_name || "User"}</span>
                  <button onClick={() => handleRemoveShare("", u.user_id)} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <input
                ref={searchInputRef}
                placeholder={pendingShares.length === 0 ? "Ketik email atau nama..." : ""}
                value={shareUserSearch}
                onChange={(e) => {
                  setShareUserSearch(e.target.value);
                  if (e.target.value.length > 2) searchUsers(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && shareUserSearch === "" && pendingShares.length > 0) {
                    handleRemoveShare("", pendingShares[pendingShares.length - 1].user_id);
                  }
                }}
                className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-sm h-7 p-0 outline-none"
              />
              {searchingUsers && <LoaderIcon className="w-4 h-4 animate-spin text-slate-400 mr-2" />}
            </div>

            {/* Search Results Dropdown */}
            {foundUsers.length > 0 && shareUserSearch.length > 0 && (
              <div className="bg-white rounded-lg py-1 border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden mt-1 absolute z-50 w-[calc(100%-40px)]">
                {foundUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleAddPendingShare(u)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-all text-left group border-b border-slate-50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 grid place-items-center text-[10px] font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {u.display_name?.slice(0, 1).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-slate-900">{u.display_name || "Tanpa Nama"}</p>
                      <p className="text-[10px] text-slate-500 truncate">{u.email || u.user_id.slice(0, 8)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* General Access */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold text-slate-600 ml-1">Akses umum</p>
            <div className="flex items-start gap-3 p-1">
              <div className={cn(
                "w-9 h-9 rounded-full grid place-items-center shrink-0",
                localIsPublic ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
              )}>
                {localIsPublic ? <GlobeIcon className="w-4 h-4" /> : <RestrictedIcon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 inline-flex items-center gap-1 font-bold text-slate-900 hover:bg-slate-200 px-2 rounded-md transition-colors -ml-2">
                      {localIsPublic ? "Siapa saja yang memiliki link" : "Dibatasi"}
                      <ChevronIcon className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 rounded-xl shadow-xl border-slate-200">
                    <DropdownMenuItem onClick={() => setLocalIsPublic(false)} className="flex items-center gap-3 py-3 px-4 focus:bg-slate-100 cursor-pointer">
                      <div className={cn("w-4 h-4 shrink-0", !localIsPublic ? "text-blue-600" : "text-transparent")}>
                        <CheckIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold">Dibatasi</p>
                        <p className="text-[10px] text-slate-500">Hanya orang yang memiliki akses yang dapat membuka</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocalIsPublic(true)} className="flex items-center gap-3 py-3 px-4 focus:bg-slate-100 cursor-pointer">
                      <div className={cn("w-4 h-4 shrink-0", localIsPublic ? "text-blue-600" : "text-transparent")}>
                        <CheckIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold">Siapa saja yang memiliki link</p>
                        <p className="text-[10px] text-slate-500">Siapa pun yang memiliki link dapat melihat</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  {localIsPublic
                    ? "Siapa pun di internet yang memiliki link ini dapat melihat"
                    : "Hanya orang yang memiliki akses yang dapat membuka dengan link ini"}
                </p>
              </div>
            </div>
          </div>


          {/* Existing Collaborators */}
          {displayShares.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold text-slate-600 ml-1">Orang yang memiliki akses</p>
              <div className="space-y-1">
                {displayShares.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center text-[10px] font-bold">
                        {s.profiles?.display_name?.slice(0, 1).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{s.profiles?.display_name || "User"}</p>
                        <p className="text-[10px] text-slate-500 truncate">{s.profiles?.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveShare(s.id, s.shared_with)} className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-[10px] rounded-lg px-3">Cabut</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-4">
          <Button
            onClick={handleCopy}
            variant="outline"
            className={cn(
              "h-9 px-4 rounded-lg border-blue-100 text-blue-600 hover:bg-blue-50 font-bold text-xs flex items-center gap-2 transition-all shrink-0",
              copied && "bg-emerald-50 text-emerald-600 border-emerald-100"
            )}
          >
            {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
            {copied ? "Berhasil disalin" : "Salin link"}
          </Button>

          <Button
            onClick={() => onSave(pendingShares, pendingRemovals)}
            disabled={shareLoading}
            className="px-8 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {shareLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
