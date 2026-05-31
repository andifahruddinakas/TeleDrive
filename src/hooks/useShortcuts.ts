import { useEffect } from "react";

interface ShortcutOptions {
  selectedIds: Set<string>;
  clearSelection: () => void;
  setSearchOpen: (val: boolean) => void;
  setPreviewUrl: (val: string | null) => void;
  setPreviewFile: (val: any) => void;
  setInfoItem: (val: any) => void;
  bulkSoftDelete: (restore: boolean) => void;
  folders: any[];
  files: any[];
  setSelectedIds: (val: Set<string>) => void;
}

export function useShortcuts({
  selectedIds,
  clearSelection,
  setSearchOpen,
  setPreviewUrl,
  setPreviewFile,
  setInfoItem,
  bulkSoftDelete,
  folders,
  files,
  setSelectedIds
}: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === "Escape") {
        if (selectedIds.size > 0) clearSelection();
        setSearchOpen(false); 
        setPreviewUrl(null); 
        setPreviewFile(null); 
        setInfoItem(null);
      }
      
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.size > 0) bulkSoftDelete(false);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        const allIds = new Set([...folders.map(f => f.id), ...files.map(f => f.id)]);
        setSelectedIds(allIds);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault(); 
        setSearchOpen(true);
        setTimeout(() => document.getElementById("main-search-input")?.focus(), 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, folders, files, clearSelection, setSearchOpen, setPreviewUrl, setPreviewFile, setInfoItem, bulkSoftDelete, setSelectedIds]);
}
