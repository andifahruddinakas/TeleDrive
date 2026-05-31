import { supabase } from "@/integrations/supabase/client"; // Updated media dependency
import { v4 as uuidv4 } from "uuid";
import { 
  CHUNK_SIZE, makeImageThumbnail, uploadChunk, downloadChunk,
} from "@/lib/telegram-storage";
import { Folder, FileRow } from "@/types/drive";

export function useDriveActions(state: any, user: any, signOut: any, notify: any, STORAGE_LIMIT: number, MAX_FILE_SIZE: number) {
  const {
    setView, setSearch, setLoading, setFolders, setFiles, setTrail, setSelectedIds,
    setSearchOpen, setNewFolderOpen, setNewFolderName, setRenameTarget, setRenameValue,
    setDeleteDialog, setPreviewUrl, setPreviewTextContent, setPreviewFile, setUploads,
    setProfileOpen, setSecurityOpen, setProfileName, setProfileAvatar, setNewPassword,
    setProfileLoading, setProcessingMessage, setTgSetupOpen, setUploadDialogOpen,
    setActionsOpen, setShareLoading, setMoveDialogOpen, setMoveTarget, setAllFolders,
    setShareDialogOpen, setShareFile, setCopied, setTgToken, setBotUsername,
    setIsLocked, setSyncDialogOpen, setLocalMedia, setIsSyncing, setTotalSize, setStats,
    setSort, setInfoItem, setFoundUsers, setFileShares, setSearchingUsers, setActiveFilter,
    view, search, folders, files, trail, selectedIds, currentFolder, sort,
    profileName, profileAvatar, newPassword, tgToken, botUsername, uploads, totalSize, biometricEnabled,
    renameTarget, renameValue, moveTarget
  } = state;

  async function load() {
    if (!user) return;
    setLoading(true);
    let folderQ = supabase.from("folders").select("*").eq("user_id", user.id).order(sort.field === 'size' ? 'name' : sort.field, { ascending: sort.order === 'asc' });
    let fileQ = supabase.from("files").select("*").eq("user_id", user.id).order(sort.field, { ascending: sort.order === 'asc' });

    if (view === "trash") {
      folderQ = folderQ.eq("is_deleted", true);
      fileQ = fileQ.eq("is_deleted", true);
    } else if (view === "starred") {
      folderQ = folderQ.eq("is_starred", true).eq("is_deleted", false);
      fileQ = fileQ.eq("is_starred", true).eq("is_deleted", false);
    } else if (search.trim()) {
      folderQ = folderQ.ilike("name", `%${search}%`).eq("is_deleted", false);
      fileQ = fileQ.ilike("name", `%${search}%`).eq("is_deleted", false);
    } else {
      if (currentFolder?.id) {
        folderQ = folderQ.eq("parent_id", currentFolder.id);
        fileQ = fileQ.eq("folder_id", currentFolder.id);
      } else {
        folderQ = folderQ.is("parent_id", null);
        fileQ = fileQ.is("folder_id", null);
      }
      folderQ = folderQ.eq("is_deleted", false);
      fileQ = fileQ.eq("is_deleted", false);
    }


    const [f, fi] = await Promise.all([folderQ, fileQ]);
    if (f.error) notify({ title: "Error", description: f.error.message, variant: "destructive" });
    if (fi.error) notify({ title: "Error", description: fi.error.message, variant: "destructive" });

    const foldersData = (f.data || []) as any[];
    const folderIds = foldersData.map(f => f.id);
    
    // Fetch item counts for these folders
    if (folderIds.length > 0) {
      const [{ data: fileCounts }, { data: subfolderCounts }] = await Promise.all([
        supabase.from("files").select("folder_id").in("folder_id", folderIds).eq("is_deleted", false),
        supabase.from("folders").select("parent_id").in("parent_id", folderIds).eq("is_deleted", false)
      ]);

      foldersData.forEach(folder => {
        const fCount = (fileCounts || []).filter(fc => fc.folder_id === folder.id).length;
        const sCount = (subfolderCounts || []).filter(sc => sc.parent_id === folder.id).length;
        folder.item_count = fCount + sCount;
      });
    }

    setFolders(foldersData);
    setFiles((fi.data || []) as any);

    const s: Record<string, number> = { image: 0, video: 0, audio: 0, document: 0, archive: 0, other: 0 };
    let total = 0;
    const { data: allFiles } = await supabase.from("files").select("size, mime_type").eq("user_id", user.id).eq("is_deleted", false);
    (allFiles || []).forEach(file => {
      total += file.size;
      const m = file.mime_type || "";
      if (m.startsWith("image/")) s.image += file.size;
      else if (m.startsWith("video/")) s.video += file.size;
      else if (m.startsWith("audio/")) s.audio += file.size;
      else if (m.includes("pdf") || m.includes("text") || m.includes("doc")) s.document += file.size;
      else if (m.includes("zip") || m.includes("rar") || m.includes("7z")) s.archive += file.size;
      else s.other += file.size;
    });
    setTotalSize(total);
    setStats(s);
    setLoading(false);
  }

  async function loadProfile() {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (data) {
      setProfileName(data.display_name || "");
      setProfileAvatar(data.avatar_url || "");
      
      if (import.meta.env.VITE_USE_SINGLE_TOKEN === 'true') {
        setTgToken(import.meta.env.VITE_TELEGRAM_BOT_TOKEN || "");
        setBotUsername(import.meta.env.VITE_APP_NAME || "System Bot");
      } else {
        setTgToken((data as any).telegram_bot_token || "");
        setBotUsername((data as any).telegram_bot_username || "");
      }
    }
  }

  async function updateTelegramSettings() {
    if (!user) return;
    if (import.meta.env.VITE_USE_SINGLE_TOKEN === 'true') {
      notify({ title: "Dibatasi", description: "Sistem menggunakan token global. Anda tidak dapat mengubahnya.", variant: "destructive" });
      return;
    }
    setProfileLoading(true);
    const { error } = await supabase.from("profiles").update({
      telegram_bot_token: tgToken,
      telegram_bot_username: botUsername,
    }).eq("user_id", user.id);
    if (error) notify({ title: "Gagal", description: error.message, variant: "destructive" });
    else { notify({ title: "Berhasil diperbarui" }); setTgSetupOpen(false); loadProfile(); }
    setProfileLoading(false);
  }

  async function updateProfile() {
    if (!user) return;
    setProfileLoading(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profileName,
      avatar_url: profileAvatar,
    }).eq("user_id", user.id);
    if (error) notify({ title: "Gagal", description: error.message, variant: "destructive" });
    else { notify({ title: "Profil diperbarui" }); setProfileOpen(false); loadProfile(); }
    setProfileLoading(false);
  }

  async function updatePassword() {
    if (!user) return;
    setProfileLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) notify({ title: "Gagal", description: error.message, variant: "destructive" });
    else { notify({ title: "Password diperbarui" }); setSecurityOpen(false); setNewPassword(""); }
    setProfileLoading(false);
  }

  async function createFolder() {
    if (!user || !state.newFolderName.trim()) return;
    const { error } = await supabase.from("folders").insert({
      name: state.newFolderName.trim(),
      user_id: user.id,
      parent_id: currentFolder?.id || null,
    });
    if (error) notify({ title: "Gagal", description: error.message, variant: "destructive" });
    else { notify({ title: "Folder dibuat" }); setNewFolderOpen(false); setNewFolderName(""); load(); }
  }

  const handleFiles = async (filesToUpload: FileList | File[]) => {
    if (!user) return;
    for (const f of Array.from(filesToUpload)) {
      if (f.size > MAX_FILE_SIZE) {
        notify({ title: "File terlalu besar", description: `${f.name} melebihi batas 2GB`, variant: "destructive" });
        continue;
      }
      if (totalSize + f.size > STORAGE_LIMIT) {
        notify({ title: "Penyimpanan penuh", description: "Tidak cukup ruang untuk mengunggah file ini.", variant: "destructive" });
        break;
      }
      processUpload(f);
    }
  };

  const processUpload = async (file: File) => {
    const uploadId = uuidv4();
    const newUpload = { id: uploadId, name: file.name, size: file.size, pct: 0, status: "uploading" };
    setUploads((prev: any) => ({ ...prev, [uploadId]: newUpload }));
    setUploadDialogOpen(true);

    try {
      const { data: fileRecord, error: fileErr } = await supabase.from("files").insert({
        name: file.name,
        size: file.size,
        mime_type: file.type,
        user_id: user.id,
        folder_id: currentFolder?.id || null,
      }).select().single();

      if (fileErr) throw fileErr;

      let thumbUrl = "";
      if (file.type.startsWith("image/")) {
        thumbUrl = await makeImageThumbnail(file);
        await supabase.from("files").update({ thumbnail_data_url: thumbUrl }).eq("id", fileRecord.id);
      }

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const { telegram_file_id, telegram_message_id } = await uploadChunk(chunk, file.name);
        
        await supabase.from("file_chunks").insert({
          file_id: fileRecord.id,
          chunk_index: i,
          telegram_file_id,
          telegram_message_id,
          size: chunk.size,
        });

        const pct = Math.round(((i + 1) / totalChunks) * 100);
        setUploads((prev: any) => ({ ...prev, [uploadId]: { ...prev[uploadId], pct } }));
      }

      // Finalize upload (just load fresh data)
      setUploads((prev: any) => {
        const next = { ...prev };
        delete next[uploadId];
        return next;
      });
      load();
    } catch (e: any) {
      setUploads((prev: any) => ({ ...prev, [uploadId]: { ...prev[uploadId], status: "error" } }));
      notify({ title: "Gagal mengunggah", description: e.message, variant: "destructive" });
    }
  };

  const handleReupload = (id: string) => {
    // Basic reupload: for now just removes error state
    setUploads((prev: any) => ({ ...prev, [id]: { ...prev[id], status: "uploading", pct: 0 } }));
  };

  const cancelUpload = (id: string) => {
    setUploads((prev: any) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  async function toggleStar(id: string, current: boolean, type: "file" | "folder" = "file") {
    const table = type === "file" ? "files" : "folders";
    await supabase.from(table).update({ is_starred: !current } as any).eq("id", id);
    load();
  }

  async function toggleSoftDelete(id: string, type: "file" | "folder" = "file", restore: boolean = false) {
    const table = type === "file" ? "files" : "folders";
    await supabase.from(table).update({ is_deleted: !restore } as any).eq("id", id);
    load();
  }

  async function bulkSoftDelete(restore: boolean = false) {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await supabase.from("files").update({ is_deleted: !restore } as any).in("id", ids);
    await supabase.from("folders").update({ is_deleted: !restore } as any).in("id", ids);
    setSelectedIds(new Set());
    load();
  }

  async function emptyTrash() {
    setProcessingMessage("Mengosongkan tempat sampah...");
    const { data: trashFiles } = await supabase.from("files").select("id").eq("user_id", user.id).eq("is_deleted", true);
    const { data: trashFolders } = await supabase.from("folders").select("id").eq("user_id", user.id).eq("is_deleted", true);
    
    if (trashFiles) await supabase.from("files").delete().in("id", trashFiles.map(f => f.id));
    if (trashFolders) await supabase.from("folders").delete().in("id", trashFolders.map(f => f.id));
    
    notify({ title: "Tempat sampah dikosongkan" });
    setProcessingMessage(null);
    load();
  }

  async function bulkDeletePermanently() {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setProcessingMessage("Menghapus permanen...");
    await supabase.from("files").delete().in("id", ids);
    await supabase.from("folders").delete().in("id", ids);
    setSelectedIds(new Set());
    notify({ title: "Item dihapus permanen" });
    setProcessingMessage(null);
    load();
  }

  async function renameItem() {
    if (!renameTarget || !renameValue.trim()) return;
    const table = renameTarget.kind === "file" ? "files" : "folders";
    const { error } = await supabase.from(table).update({ name: renameValue.trim() } as any).eq("id", renameTarget.id);
    if (error) notify({ title: "Gagal", description: error.message, variant: "destructive" });
    else { load(); setRenameTarget(null); setRenameValue(""); }
  }

  async function duplicateFile(file: FileRow) {
    setProcessingMessage(`Menduplikasi ${file.name}...`);
    try {
      const { data: chunks } = await supabase.from("file_chunks").select("*").eq("file_id", file.id);
      if (!chunks) throw new Error("Gagal mengambil data chunk asli");
      
      const { data: newFile, error: fileErr } = await supabase.from("files").insert({
        name: `${file.name} (Salinan)`,
        size: file.size,
        mime_type: file.mime_type,
        user_id: user.id,
        folder_id: file.folder_id,
        thumbnail_data_url: file.thumbnail_data_url,
        status: "completed"
      }).select().single();

      if (fileErr) throw fileErr;

      let copied = 0;
      for (const c of chunks) {
        setProcessingMessage(`Menyalin bagian ${copied + 1}/${chunks.length}...`);
        const { data: copyData, error: copyErr } = await supabase.functions.invoke("tg-upload-chunk", { 
          body: { message_id: c.telegram_message_id } 
        });
        if (copyErr || (copyData && copyData.error)) throw new Error(copyErr?.message || copyData?.error || "Gagal menyalin file di Telegram Cloud");
        
        await supabase.from("file_chunks").insert({
          file_id: newFile.id,
          chunk_index: c.chunk_index,
          telegram_file_id: copyData.new_message_id, // For forward, message_id is used
          telegram_message_id: copyData.new_message_id,
          size: c.size,
        });
        copied++;
      }

      notify({ title: "Berhasil diduplikasi", description: file.name });
      load();
    } catch (e: any) {
      notify({ title: "Gagal duplikasi", description: e.message, variant: "destructive" });
    } finally {
      setProcessingMessage(null);
    }
  }

  async function duplicateFolder(folder: Folder) {
    setProcessingMessage(`Menduplikasi folder ${folder.name}...`);
    try {
      await performFolderDuplication(folder.id, folder.parent_id, `${folder.name} (Salinan)`);
      notify({ title: "Berhasil diduplikasi", description: folder.name });
      load();
    } catch (e: any) {
      notify({ title: "Gagal duplikasi folder", description: e.message, variant: "destructive" });
    } finally {
      setProcessingMessage(null);
    }
  }

  async function performFolderDuplication(folderId: string, targetParentId: string | null, newName: string) {
    const { data: newFolder, error: folderErr } = await supabase.from("folders").insert({
      name: newName,
      user_id: user.id,
      parent_id: targetParentId
    }).select().single();
    if (folderErr) throw folderErr;

    const { data: files } = await supabase.from("files").select("*").eq("folder_id", folderId);
    if (files) {
      for (const f of files) {
        // Simple file copy logic here or reuse duplicateFile logic
        const { data: newFile } = await supabase.from("files").insert({
          name: f.name, size: f.size, mime_type: f.mime_type, user_id: user.id, folder_id: newFolder.id, status: "completed"
        }).select().single();
        if (newFile) {
          const { data: chunks } = await supabase.from("file_chunks").select("*").eq("file_id", f.id);
          if (chunks) {
            for (const c of chunks) {
               const { data: copyData } = await supabase.functions.invoke("tg-upload-chunk", { body: { message_id: c.telegram_message_id } });
               if (copyData) {
                 await supabase.from("file_chunks").insert({
                   file_id: newFile.id, chunk_index: c.chunk_index, telegram_file_id: copyData.new_message_id, telegram_message_id: copyData.new_message_id, size: c.size
                 });
               }
            }
          }
        }
      }
    }

    const { data: subfolders } = await supabase.from("folders").select("*").eq("parent_id", folderId);
    if (subfolders) {
      for (const sub of subfolders) {
        await performFolderDuplication(sub.id, newFolder.id, sub.name);
      }
    }
  }

  async function handleDownload(file: FileRow) {
    try {
      setProcessingMessage(`Menyiapkan unduhan: ${file.name}...`);
      const { data: chunks, error: chunkErr } = await supabase.from("file_chunks").select("*").eq("file_id", file.id).order("chunk_index", { ascending: true });
      if (chunkErr || !chunks || chunks.length === 0) throw new Error("Gagal mengambil data file dari Cloud.");
      
      const blobParts: Blob[] = [];
      for (let i = 0; i < chunks.length; i++) {
        setProcessingMessage(`Mengunduh bagian ${i + 1}/${chunks.length}...`);
        const part = await downloadChunk(chunks[i].id);
        blobParts.push(part);
      }
      const fullBlob = new Blob(blobParts, { type: file.mime_type || "application/octet-stream" });
      const url = URL.createObjectURL(fullBlob);
      const a = document.createElement("a");
      a.href = url; a.download = file.name; document.body.appendChild(a);
      a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      notify({ title: "Berhasil diunduh", description: file.name });
    } catch (err: any) {
      notify({ title: "Gagal mengunduh", description: err.message, variant: "destructive" });
    } finally {
      setProcessingMessage(null);
    }
  }

  async function handleMoveItem(folderId: string | null) {
    if (!moveTarget) return;
    
    // Hard block circular reference
    if (moveTarget.kind === "folder" && folderId) {
      if (moveTarget.id === folderId) {
        notify({ title: "Gagal", description: "Tidak bisa memindahkan folder ke dirinya sendiri.", variant: "destructive" });
        return;
      }
      const descendants = getDescendantIds(moveTarget.id, folders);
      if (descendants.includes(folderId)) {
        notify({ title: "Gagal", description: "Tidak bisa memindahkan folder ke dalam sub-foldernya sendiri.", variant: "destructive" });
        return;
      }
    }

    const table = moveTarget.kind === "file" ? "files" : "folders";
    const field = moveTarget.kind === "file" ? "folder_id" : "parent_id";
    const { error } = await supabase.from(table).update({ [field]: folderId } as any).in("id", moveTarget.ids || [moveTarget.id]);
    if (error) notify({ title: "Gagal", description: error.message, variant: "destructive" });
    else { notify({ title: "Berhasil dipindahkan" }); setMoveDialogOpen(false); setMoveTarget(null); load(); }
  }

  async function bulkMove(folderId: string | null) {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setProcessingMessage("Memindahkan item...");
    const { error: fErr } = await supabase.from("files").update({ folder_id: folderId } as any).in("id", ids);
    const { error: foErr } = await supabase.from("folders").update({ parent_id: folderId } as any).in("id", ids);
    if (fErr || foErr) notify({ title: "Gagal", description: "Beberapa item gagal dipindahkan.", variant: "destructive" });
    else { notify({ title: "Berhasil dipindahkan", description: `${ids.length} item dipindahkan.` }); setSelectedIds(new Set()); setMoveDialogOpen(false); load(); }
    setProcessingMessage(null);
  }

  function getDescendantIds(folderId: string, allFolders: Folder[]): string[] {
    const descendants: string[] = [];
    const children = allFolders.filter(f => f.parent_id === folderId);
    children.forEach(child => {
      descendants.push(child.id);
      descendants.push(...getDescendantIds(child.id, allFolders));
    });
    return descendants;
  }

  async function openFile(file: FileRow) {
    if (!file.mime_type) return;
    if (file.mime_type.startsWith("image/") || file.mime_type.startsWith("video/") || file.mime_type.startsWith("audio/") || file.mime_type === "application/pdf" || file.mime_type.startsWith("text/")) {
      try {
        setProcessingMessage(`Membuka ${file.name}...`);
        const { data: chunks } = await supabase.from("file_chunks").select("*").eq("file_id", file.id).order("chunk_index", { ascending: true });
        if (!chunks || chunks.length === 0) throw new Error("Gagal memuat file");
        const blobParts: Blob[] = [];
        for (const c of chunks) {
          const part = await downloadChunk(c.id);
          blobParts.push(part);
        }
        const blob = new Blob(blobParts, { type: file.mime_type });
        const url = URL.createObjectURL(blob);
        if (file.mime_type.startsWith("text/")) {
          const text = await blob.text(); setPreviewTextContent(text);
        }
        setPreviewUrl(url); setPreviewFile(file);
      } catch (e: any) {
        notify({ title: "Gagal membuka", description: e.message, variant: "destructive" });
      } finally {
        setProcessingMessage(null);
      }
    } else {
      handleDownload(file);
    }
  }

  return {
    load, loadProfile, updateTelegramSettings, updateProfile, updatePassword, createFolder,
    handleFiles, processUpload, handleReupload, cancelUpload, toggleStar, toggleSoftDelete,
    bulkSoftDelete, emptyTrash, bulkDeletePermanently, renameItem, handleDownload,
    handleMoveItem, bulkMove, getDescendantIds, openFile,
    duplicateFile, duplicateFolder,
    handleLogout: () => { if (user) localStorage.removeItem(`teledrive_profile_${user.id}`); signOut(); },
    searchUsers: async (query: string) => {
      if (!query.trim()) return;
      setSearchingUsers(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, email, display_name")
          .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
          .neq("user_id", user.id)
          .limit(5);

        if (error) throw error;
        setFoundUsers(data || []);
      } catch (err: any) {
        notify({ title: "Gagal mencari", description: err.message, variant: "destructive" });
      } finally {
        setSearchingUsers(false);
      }
    },
    fetchFileShares: async (fileId: string) => {
      const { data } = await supabase.from("file_shares")
        .select("*, profiles:shared_with(display_name, email)")
        .eq("file_id", fileId);
      setFileShares(data || []);
    },
    shareWithUser: async (targetUser: any) => {
      if (!state.shareFile) return;
      const { error } = await supabase.from("file_shares").upsert({
        file_id: state.shareFile.id,
        shared_with: targetUser.user_id,
        shared_by: user.id
      }, { onConflict: 'file_id,shared_with' });
      
      if (error) {
        notify({ title: "Gagal berbagi", description: error.message, variant: "destructive" });
      } else {
        notify({ title: "Berhasil dibagikan", description: `File dibagikan dengan ${targetUser.display_name || 'User'}` });
        const { data } = await supabase.from("file_shares")
          .select("*, profiles:shared_with(display_name, email)")
          .eq("file_id", state.shareFile.id);
        setFileShares(data || []);
      }
    },
    unshareWithUser: async (shareId: string) => {
      const { error } = await supabase.from("file_shares").delete().eq("id", shareId);
      if (error) {
        notify({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
      } else {
        setFileShares((prev: any) => prev.filter((s: any) => s.id !== shareId));
        notify({ title: "Akses dicabut" });
      }
    },
    updateShareSettings: async (isPublic: boolean, pendingShares: any[] = [], pendingRemovals: string[] = []) => {
      if (!state.shareFile) return;
      setShareLoading(true);
      try {
        const promises: any[] = [];
        
        // 1. Update file settings
        promises.push(
          supabase.from("files").update({
            is_public: isPublic,
          } as any).eq("id", state.shareFile.id)
        );

        // 2. Add new shares
        if (pendingShares.length > 0) {
          promises.push(
            supabase.from("file_shares").upsert(
              pendingShares.map(u => ({
                file_id: state.shareFile.id,
                shared_with: u.user_id,
                shared_by: user.id
              })), 
              { onConflict: 'file_id,shared_with' }
            )
          );
        }

        // 3. Remove old shares
        if (pendingRemovals.length > 0) {
          promises.push(
            supabase.from("file_shares").delete().in("id", pendingRemovals)
          );
        }

        const results = await Promise.all(promises);
        const err = results.find(r => r.error);
        if (err) throw err.error;
        
        notify({ title: "Berhasil diperbarui", description: "Pengaturan berbagi telah disimpan." });
        setShareDialogOpen(false);
        load();
      } catch (err: any) {
        notify({ title: "Gagal memperbarui", description: err.message, variant: "destructive" });
      } finally {
        setShareLoading(false);
      }
    }
  };
}
