import React from "react";
import { ExternalLink, Cloud, Folder, ChevronRight, ChevronDown, X } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MoveDialogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moveTarget: any;
  allFolders: any[];
  currentFolder: any;
  selectedIds: Set<string>;
  handleMoveItem: (folderId: string | null) => void;
  bulkMove: (folderId: string | null) => void;
  getDescendantIds: (folderId: string, folders: any[]) => string[];
}

interface TreeItemProps {
  folder: any;
  level: number;
  onSelect: (id: string) => void;
  allFolders: any[];
  invalidIds: string[];
}

const FolderTreeItem: React.FC<TreeItemProps> = ({ folder, level, onSelect, allFolders, invalidIds }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const children = allFolders.filter(f => f.parent_id === folder.id);
  const isInvalid = invalidIds.includes(folder.id);

  return (
    <div className="w-fit min-w-full">
      <div
        className={cn(
          "group flex items-center gap-2 p-1.5 rounded-lg transition-all border-2 border-dashed mb-1 whitespace-nowrap",
          isInvalid
            ? "opacity-40 grayscale cursor-not-allowed bg-secondary/20 border-transparent"
            : "hover:bg-primary/5 border-primary/10 bg-card cursor-pointer active:scale-[0.98] shadow-sm"
        )}
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => !isInvalid && onSelect(folder.id)}
      >
        <div className="flex items-center gap-1.5 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className={cn(
              "w-6 h-6 rounded-md hover:bg-primary/10 flex items-center justify-center transition-colors shrink-0",
              children.length === 0 && "opacity-0 pointer-events-none"
            )}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className={cn(
            "w-8 h-8 rounded-lg grid place-items-center shrink-0 shadow-sm",
            isInvalid ? "bg-zinc-500/10" : "bg-amber-500/10"
          )}>
            <Folder className={cn("w-4 h-4", isInvalid ? "text-zinc-400" : "text-amber-600 fill-amber-600/20")} />
          </div>

          <div className="ml-1 pr-6">
            <p className={cn("font-bold text-[13px]", isInvalid ? "text-muted-foreground" : "text-foreground")}>/{folder.name}</p>
          </div>
        </div>
      </div>

      {isOpen && children.length > 0 && (
        <div className="relative">
          {/* Guide Line */}
          <div
            className="absolute left-0 top-0 bottom-0 border-l-2 border-primary/20 border-dotted"
            style={{ marginLeft: `${level * 20 + 11}px` }}
          />
          {children.map(child => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              level={level + 1}
              onSelect={onSelect}
              allFolders={allFolders}
              invalidIds={invalidIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MoveDialogSheet: React.FC<MoveDialogSheetProps> = ({
  open,
  onOpenChange,
  moveTarget,
  allFolders,
  currentFolder,
  selectedIds,
  handleMoveItem,
  bulkMove,
  getDescendantIds
}) => {
  const invalidIds = React.useMemo(() => {
    const ids: string[] = [];
    if (moveTarget) {
      const targetIds = moveTarget.ids || (moveTarget.id ? [moveTarget.id] : []);
      if (moveTarget.kind === 'folder') {
        targetIds.forEach(tId => {
          ids.push(tId);
          ids.push(...getDescendantIds(tId, allFolders));
        });
      }
      const firstTargetId = targetIds[0];
      const targetData = allFolders.find(f => f.id === firstTargetId);
      if (targetData) {
        const currentParentId = moveTarget.kind === 'folder' ? targetData.parent_id : targetData.folder_id;
        if (currentParentId) ids.push(currentParentId);
      }
    } else {
      const selectedFolderIds = Array.from(selectedIds).filter(id => allFolders.some(f => f.id === id));
      ids.push(...selectedFolderIds);
      for (const sfId of selectedFolderIds) {
        ids.push(...getDescendantIds(sfId, allFolders));
      }
      if (currentFolder) ids.push(currentFolder.id);
    }
    return ids;
  }, [moveTarget, allFolders, selectedIds, getDescendantIds, currentFolder]);

  const rootFolders = allFolders.filter(f => !f.parent_id);

  const isCurrentlyInRoot = React.useMemo(() => {
    if (!moveTarget) return !currentFolder;
    const targetIds = moveTarget.ids || (moveTarget.id ? [moveTarget.id] : []);
    const firstTarget = allFolders.find(f => f.id === targetIds[0]);
    if (!firstTarget) return false;
    return moveTarget.kind === 'folder' ? firstTarget.parent_id === null : firstTarget.folder_id === null;
  }, [moveTarget, allFolders, currentFolder]);

  const onSelectFolder = (id: string | null) => {
    if (moveTarget) handleMoveItem(id);
    else bulkMove(id);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg h-[85vh] sm:h-[70vh] p-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-xl flex flex-col">
        <div className="p-6 pb-4 border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center justify-between">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold flex items-center gap-3 tracking-tight">
                <div className="w-12 h-12 rounded-lg bg-primary/10 grid place-items-center shadow-inner">
                  <ExternalLink className="w-6 h-6 text-primary" />
                </div>
                Pindahkan {moveTarget?.kind === "folder" ? "Folder" : "File"}
              </SheetTitle>
            </SheetHeader>
            <button
              onClick={() => onOpenChange(false)}
              className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-4 flex flex-col gap-4">
          <div className="flex-1 overflow-auto border rounded-lg bg-card/20 p-2 min-h-[300px]">
            <div className="min-w-max space-y-1">
              {/* Root Directory - Now inside the tree container */}
              <button
                onClick={() => !isCurrentlyInRoot && onSelectFolder(null)}
                disabled={isCurrentlyInRoot}
                className={cn(
                  "w-full flex items-center gap-2 p-1.5 rounded-lg transition-all border-2 border-dashed whitespace-nowrap",
                  isCurrentlyInRoot
                    ? "opacity-40 grayscale cursor-not-allowed bg-secondary/20 border-transparent"
                    : "hover:bg-primary/5 border-primary/10 bg-card cursor-pointer active:scale-[0.98] shadow-sm"
                )}
              >
                <div className="flex items-center gap-1.5 flex-1 ml-[30px]"> {/* Aligned with folder text */}
                  <div className={cn(
                    "w-8 h-8 rounded-lg grid place-items-center shrink-0 shadow-sm",
                    isCurrentlyInRoot ? "bg-zinc-500/10" : "bg-primary/10 group-hover:bg-primary/20"
                  )}>
                    <Cloud className={cn("w-4 h-4", isCurrentlyInRoot ? "text-zinc-400" : "text-primary")} />
                  </div>
                  <div className="ml-1 pr-6">
                    <p className={cn("font-bold text-[13px] tracking-tight", isCurrentlyInRoot ? "text-zinc-400" : "text-foreground")}>/</p>
                  </div>
                </div>
              </button>

              {/* Tree View Folders */}
              {rootFolders.map(folder => (
                <FolderTreeItem
                  key={folder.id}
                  folder={folder}
                  level={0}
                  onSelect={onSelectFolder}
                  allFolders={allFolders}
                  invalidIds={invalidIds}
                />
              ))}
            </div>

            {allFolders.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <Folder className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Belum ada folder</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
