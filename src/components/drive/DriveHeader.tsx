import React from "react";
import {
  ArrowLeft, List, LayoutGrid, Search, ArrowUpDown, ChevronRight, X,
  Trash2, Moon, Sun, User as UserIcon, Lock, LogOut, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Re-checking imports from original Drive.tsx
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {
  DropdownMenu as DM, DropdownMenuContent as DMC, DropdownMenuItem as DMI, DropdownMenuTrigger as DMT
} from "@/components/ui/dropdown-menu";

interface DriveHeaderProps {
  view: string;
  currentFolder: any;
  goBack: () => void;
  APP_NAME: string;
  files: any[];
  folders: any[];
  filteredFiles: any[];
  currentFilesSize: number;
  formatBytes: (bytes: number) => string;
  activeFilter: string;
  setActiveFilter: (val: string) => void;
  emptyTrash: () => void;
  viewMode: "grid" | "list";
  setViewMode: (val: "grid" | "list") => void;
  searchOpen: boolean;
  setSearchOpen: (val: any) => void;
  search: string;
  setSearch: (val: string) => void;
  load: () => void;
  sort: any;
  setSort: (val: any) => void;
  initials: string;
  profileName: string | null;
  user: any;
  STORAGE_LIMIT: number;
  totalSize: number;
  notify: (payload: any) => void;
  toggleTheme: () => void;
  theme: string;
  setProfileOpen: (val: boolean) => void;
  setSecurityOpen: (val: boolean) => void;
  handleLogout: () => void;
  trail: any[];
  goBreadcrumb: (index: number) => void;
  onDragOverInternal: (e: any) => void;
  onDragLeaveInternal: (e: any) => void;
  onDropInternal: (e: any, folderId: string | null) => void;
  handleDragOver: (e: any) => void;
  handleDrop: (e: any, folderId: string | null) => void;
}

export const DriveHeader: React.FC<DriveHeaderProps> = ({
  view,
  currentFolder,
  goBack,
  APP_NAME,
  files,
  folders,
  filteredFiles,
  currentFilesSize,
  formatBytes,
  activeFilter,
  setActiveFilter,
  emptyTrash,
  viewMode,
  setViewMode,
  searchOpen,
  setSearchOpen,
  search,
  setSearch,
  load,
  sort,
  setSort,
  initials,
  profileName,
  user,
  STORAGE_LIMIT,
  totalSize,
  notify,
  toggleTheme,
  theme,
  setProfileOpen,
  setSecurityOpen,
  handleLogout,
  trail,
  goBreadcrumb,
  onDragOverInternal,
  onDragLeaveInternal,
  onDropInternal,
  handleDragOver,
  handleDrop
}) => {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm px-4 pt-6 pb-2" translate="no">
      <div className="max-w-7xl mx-auto space-y-2">
        <div className="flex items-center gap-3">
          {currentFolder ? (
            <button
              onClick={goBack}
              className="w-10 h-10 grid place-items-center rounded-lg bg-secondary hover:bg-secondary/80 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={(e: any) => handleDrop(e, null)}
              className="w-9 h-9 rounded-lg bg-white overflow-hidden grid place-items-center shadow-sm border border-border/40"
            >
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate leading-tight tracking-tight">
              <span>{currentFolder?.name ?? APP_NAME}</span>
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground truncate tracking-widest">
              akar-dev.com
            </p>
          </div>

          {activeFilter === "trash" && (folders.length > 0 || filteredFiles.length > 0) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={emptyTrash}
              className="rounded-lg h-9 px-4 text-[10px] font-black shadow-lg shadow-rose-500/20 hidden md:flex mr-1"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              BERSIHKAN SAMPAH
            </Button>
          )}

          <button
            onClick={toggleTheme}
            className="w-10 h-10 grid place-items-center rounded-full hover:bg-secondary active:scale-95 transition text-muted-foreground"
            aria-label="Ubah Tema"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setSearchOpen((v: any) => !v)}
            className="w-10 h-10 grid place-items-center rounded-full hover:bg-secondary active:scale-95 transition text-muted-foreground"
            aria-label="Cari"
          >
            <Search className="w-5 h-5" />
          </button>

          <DM>
            <DMT asChild>
              <button
                className="w-9 h-9 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm grid place-items-center shadow-card active:scale-95 transition"
                aria-label="Akun"
              >
                {initials}
              </button>
            </DMT>
            <DMC align="end" className="w-60 rounded-xl shadow-elegant border-none p-1.5">
              <div className="px-4 py-3 mb-1.5 rounded-lg bg-primary/5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate text-foreground">
                    {profileName || (user?.email?.split('@')[0].split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || "Pengguna")}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate font-medium">{user?.email}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 grid place-items-center shrink-0 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>



              <DMI onClick={() => setProfileOpen(true)}>
                <div className="mr-2.5 pr-2.5 border-r border-border/50">
                  <UserIcon className="w-4 h-4" />
                </div>
                Profil
              </DMI>
              <DMI onClick={() => setSecurityOpen(true)}>
                <div className="mr-2.5 pr-2.5 border-r border-border/50">
                  <Lock className="w-4 h-4" />
                </div>
                Keamanan
              </DMI>
              <DMI onClick={handleLogout} className="text-destructive focus:text-destructive">
                <div className="mr-2.5 pr-2.5 border-r border-destructive/20">
                  <LogOut className="w-4 h-4" />
                </div>
                Keluar
              </DMI>
            </DMC>
          </DM>
        </div>

        {(searchOpen || view === "drive" || view === "starred") && (
          <div className="pb-0 space-y-2">
            {searchOpen && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="main-search-input"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari file atau folder..."
                  className="pl-9 pr-9 h-11 bg-secondary border-0 rounded-lg font-medium focus-visible:ring-1 focus-visible:ring-primary/20"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); load(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full hover:bg-background"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            {(view === "drive" || view === "starred") && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none h-12 px-4 -mx-4 bg-secondary/30 border-y border-border/40">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'image', label: 'Gambar' },
                  { id: 'video', label: 'Video' },
                  { id: 'audio', label: 'Audio' },
                  { id: 'document', label: 'Dokumen' },
                  { id: 'other', label: 'Lainnya' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeFilter === f.id ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-card text-muted-foreground border border-border/60 hover:bg-secondary/50"
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
