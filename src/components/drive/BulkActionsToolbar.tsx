import React from "react";
import { Check, Trash2, ExternalLink, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionsToolbarProps {
  selectedIds: Set<string>;
  view: string;
  clearSelection: () => void;
  bulkSoftDelete: (restore: boolean) => void;
  bulkDeletePermanently: () => void;
  setMoveDialogOpen: (val: boolean) => void;
  setMoveTarget: (val: any) => void;
  selectAll?: () => void;
  isAllSelected?: boolean;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedIds,
  view,
  clearSelection,
  bulkSoftDelete,
  bulkDeletePermanently,
  setMoveDialogOpen,
  setMoveTarget,
  selectAll,
  isAllSelected
}) => {
  if (selectedIds.size === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md px-2">
      <div className="bg-zinc-900/95 backdrop-blur-xl text-white rounded-lg p-2.5 shadow-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 ml-1">
          <button 
            onClick={selectAll}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isAllSelected ? 'bg-primary text-white' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}
          >
            <Check className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white leading-tight">{selectedIds.size} dipilih</p>
            <button onClick={clearSelection} className="text-[10px] text-white/50 hover:text-white transition-colors">Batal</button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {view === "trash" ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => bulkSoftDelete(true)} className="h-9 px-3 rounded-lg hover:bg-white/10 text-emerald-400 text-xs font-medium">
                <RefreshCcw className="w-4 h-4 mr-1.5" /> Pulihkan
              </Button>
              <Button variant="ghost" size="sm" onClick={() => bulkDeletePermanently()} className="h-9 px-3 rounded-lg hover:bg-rose-500/20 text-rose-400 text-xs font-medium">
                <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => bulkSoftDelete(false)} className="h-9 px-3 rounded-lg hover:bg-white/10 text-rose-400 text-xs font-medium">
                <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setMoveTarget(null); setMoveDialogOpen(true); }} className="h-9 px-3 rounded-lg hover:bg-white/10 text-primary text-xs font-medium">
                <ExternalLink className="w-4 h-4 mr-1.5" /> Pindah
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
