import { supabase } from "@/integrations/supabase/client";

export function useDriveDragDrop(state: any, actions: any, notify: any) {
  const { 
    selectedIds, setSelectedIds, files, folders, allFolders, setProcessingMessage 
  } = state;
  const { load, getDescendantIds } = actions;

  const onDragStartInternal = (e: React.DragEvent, id: string, kind: 'file' | 'folder') => {
    const ids = selectedIds.has(id) ? Array.from(selectedIds) : [id];
    
    if (ids.length > 1) {
      const dragPreview = document.createElement('div');
      dragPreview.className = 'fixed top-0 left-0 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl pointer-events-none z-[9999]';
      dragPreview.innerText = `Memindahkan ${ids.length} item`;
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 0, 0);
      setTimeout(() => document.body.removeChild(dragPreview), 0);
    }

    e.dataTransfer.setData("teledrive_ids", JSON.stringify(ids));
    e.dataTransfer.setData("teledrive_kind", kind);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOverInternal = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add('bg-primary/10', 'scale-105');
  };

  const onDragLeaveInternal = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/10', 'scale-105');
  };

  const onDropInternal = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-primary/10', 'scale-105');
    
    const idsStr = e.dataTransfer.getData("teledrive_ids");
    if (!idsStr) return;
    
    const ids = JSON.parse(idsStr) as string[];
    if (ids.length === 0) return;
    if (targetFolderId && ids.includes(targetFolderId)) return;

    setProcessingMessage(`Memindahkan ${ids.length} item...`);
    
    try {
      const selectedFiles = ids.filter(id => files.some((f: any) => f.id === id));
      const selectedFolders = ids.filter(id => folders.some((fo: any) => fo.id === id));

      if (selectedFiles.length > 0) {
        await supabase.from("files").update({ folder_id: targetFolderId } as any).in("id", selectedFiles);
      }
      if (selectedFolders.length > 0) {
        const validFolders = selectedFolders.filter(fid => {
          if (!targetFolderId) return true;
          const descendants = getDescendantIds(fid, allFolders);
          return !descendants.includes(targetFolderId);
        });
        if (validFolders.length > 0) {
          await supabase.from("folders").update({ parent_id: targetFolderId } as any).in("id", validFolders);
        }
      }

      notify({ title: "Berhasil dipindahkan", description: `${ids.length} item dipindahkan.` });
      setSelectedIds(new Set());
      load();
    } catch (err: any) {
      notify({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setProcessingMessage(null);
    }
  };

  return { onDragStartInternal, onDragOverInternal, onDragLeaveInternal, onDropInternal };
}
