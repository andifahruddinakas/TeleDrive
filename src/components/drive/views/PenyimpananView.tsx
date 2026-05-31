import React from "react";
import { FileExplorer } from "../FileExplorer";
import { TrashBanner } from "../TrashBanner";
import { BulkActionsToolbar } from "../BulkActionsToolbar";
import { List, LayoutGrid, ArrowUpDown, ChevronRight } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface PenyimpananViewProps {
  view: string;
  loading: boolean;
  trail: any[];
  setTrail: (val: any[]) => void;
  selectedIds: Set<string>;
  setSelectedIds: (val: any) => void;
  clearSelection: () => void;
  viewMode: "grid" | "list";
  setViewMode: (val: "grid" | "list") => void;
  sort: any;
  setSort: (val: any) => void;
  activeFilter: string;
  folders: any[];
  filteredFiles: any[];
  openFile: (file: any) => void;
  toggleStar: any;
  handleDownload: any;
  setDeleteDialog: any;
  toggleSoftDelete: any;
  setShareFile: any;
  setShareDialogOpen: any;
  setRenameTarget: any;
  setRenameValue: any;
  setMoveTarget: any;
  setMoveDialogOpen: any;
  duplicateFile: any;
  duplicateFolder: any;
  setInfoItem: any;
  onDragStartInternal: any;
  onDragOverInternal: any;
  onDragLeaveInternal: any;
  onDropInternal: any;
  formatBytes: any;
  emptyTrash: any;
  bulkSoftDelete: any;
  bulkDeletePermanently: any;
}

export const PenyimpananView: React.FC<PenyimpananViewProps> = ({
  view,
  loading,
  trail,
  setTrail,
  selectedIds,
  setSelectedIds,
  clearSelection,
  viewMode,
  setViewMode,
  sort,
  setSort,
  activeFilter,
  folders,
  filteredFiles,
  openFile,
  toggleStar,
  handleDownload,
  setDeleteDialog,
  toggleSoftDelete,
  setShareFile,
  setShareDialogOpen,
  setRenameTarget,
  setRenameValue,
  setMoveTarget,
  setMoveDialogOpen,
  duplicateFile,
  duplicateFolder,
  setInfoItem,
  onDragStartInternal,
  onDragOverInternal,
  onDragLeaveInternal,
  onDropInternal,
  formatBytes,
  emptyTrash,
  bulkSoftDelete,
  bulkDeletePermanently,
}) => {
  return (
    <div className="space-y-3">
      {view === "trash" && <TrashBanner emptyTrash={emptyTrash} />}
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h2 className="text-xl font-bold text-foreground shrink-0">
              {view === "drive" && "Drive Saya"}
              {view === "starred" && "Favorit"}
              {view === "trash" && "Sampah"}
            </h2>
            
            {trail.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-muted-foreground/60">
                {trail.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2 shrink-0">
                    <span className="text-xs">/</span>
                    <button 
                      onClick={() => setTrail(trail.slice(0, i + 1))} 
                      className={`text-sm font-medium transition-colors truncate max-w-[100px] ${i === trail.length - 1 ? "text-foreground font-bold" : "hover:text-primary"}`}
                    >
                      {f.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="w-8 h-8 grid place-items-center rounded-lg bg-card border border-border/40 hover:border-primary/40 text-muted-foreground transition-all shadow-sm"
              aria-label="Ubah Tampilan"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-8 h-8 grid place-items-center rounded-lg bg-card border border-border/40 hover:border-primary/40 text-muted-foreground transition-all shadow-sm"
                  aria-label="Urutkan"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-elegant border-none p-1.5">
                <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 mb-1">Urutkan Berdasarkan</div>
                {[
                  { label: 'Nama', field: 'name' },
                  { label: 'Ukuran', field: 'size' },
                  { label: 'Tanggal', field: 'created_at' },
                ].map((opt: any) => (
                  <DropdownMenuItem key={opt.field} onClick={() => setSort({ field: opt.field, order: sort.field === opt.field && sort.order === 'asc' ? 'desc' : 'asc' })} className="rounded-lg">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{opt.label}</span>
                      {sort.field === opt.field && (
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${sort.order === 'asc' ? '-rotate-90' : 'rotate-90'}`} />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <BulkActionsToolbar 
              selectedIds={selectedIds} 
              view={view} 
              clearSelection={clearSelection} 
              bulkSoftDelete={bulkSoftDelete} 
              bulkDeletePermanently={bulkDeletePermanently} 
              setMoveDialogOpen={setMoveDialogOpen} 
              setMoveTarget={setMoveTarget}
              isAllSelected={selectedIds.size > 0 && selectedIds.size === (folders.length + filteredFiles.length)}
              selectAll={() => {
                if (selectedIds.size === (folders.length + filteredFiles.length)) {
                  clearSelection();
                } else {
                  const allIds = new Set([...folders.map(f => f.id), ...filteredFiles.map(f => f.id)]);
                  setSelectedIds(allIds);
                }
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Memuat file...</p>
        </div>
      ) : (
        <FileExplorer 
          viewMode={viewMode} activeFilter={activeFilter} view={view} folders={folders} filteredFiles={filteredFiles} selectedIds={selectedIds} 
          toggleSelect={(id) => setSelectedIds((prev: Set<string>) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; })} 
          openFolder={(f: any) => setTrail([...trail, f])} handlePreview={openFile} toggleStar={toggleStar} downloadFile={handleDownload} deleteFile={(f: any) => setDeleteDialog({ type: "file", target: f, open: true })} deleteFolder={(f: any) => setDeleteDialog({ type: "folder", target: f, open: true })} toggleSoftDelete={toggleSoftDelete} 
          setShareFile={setShareFile} setShareDialogOpen={setShareDialogOpen} setRenameTarget={setRenameTarget} setRenameValue={setRenameValue} setMoveTarget={setMoveTarget} setMoveDialogOpen={setMoveDialogOpen} 
          duplicateFile={duplicateFile} duplicateFolder={duplicateFolder} setInfoItem={setInfoItem} 
          onDragStartInternal={onDragStartInternal} onDragOverInternal={onDragOverInternal} 
          onDragLeaveInternal={onDragLeaveInternal} onDropInternal={onDropInternal} 
          formatBytes={formatBytes} 
        />
      )}
    </div>
  );
};
