import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Cloud, Lock, Clock, HardDrive, LayoutGrid, List, Plus, Search, Star, Trash2, Home, Database } from "lucide-react";
import { formatBytes } from "@/lib/telegram-storage";

// Modular components
import { StorageStats } from "@/components/drive/StorageStats";
import { TrashBanner } from "@/components/drive/TrashBanner";
import { CategoryNav } from "@/components/drive/CategoryNav";
import { BulkActionsToolbar } from "@/components/drive/BulkActionsToolbar";
import { RenameDialog } from "@/components/drive/modals/RenameDialog";
import { PreviewDialog } from "@/components/drive/modals/PreviewDialog";
import { DeleteDialog } from "@/components/drive/modals/DeleteDialog";
import { ShareDialog } from "@/components/drive/modals/ShareDialog";
import { DriveHeader } from "@/components/drive/DriveHeader";
import { FileExplorer } from "@/components/drive/FileExplorer";
import { FloatingActions } from "@/components/drive/FloatingActions";
import { SecurityDialog } from "@/components/drive/modals/SecurityDialog";
import { NewFolderDialog } from "@/components/drive/modals/NewFolderDialog";
import { SyncDialog } from "@/components/drive/modals/SyncDialog";
import { UploadProgressSheet } from "@/components/drive/modals/UploadProgressSheet";
import { InfoSheet } from "@/components/drive/modals/InfoSheet";
import { CloudSetupDialog } from "@/components/drive/modals/CloudSetupDialog";
import { ProfileDialog } from "@/components/drive/modals/ProfileDialog";
import { MoveDialogSheet } from "@/components/drive/modals/MoveDialogSheet";
import { NotificationDialog } from "@/components/drive/modals/NotificationDialog";

// Views
import { HomeView } from "@/components/drive/views/HomeView";
import { PenyimpananView } from "@/components/drive/views/PenyimpananView";
import { KapasitasView } from "@/components/drive/views/KapasitasView";

// Hooks
import { useDriveState } from "@/hooks/useDriveState";
import { useDriveActions } from "@/hooks/useDriveActions";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useDriveDragDrop } from "@/hooks/useDriveDragDrop";

const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || (500 * 1024 * 1024);
const STORAGE_LIMIT = Number(import.meta.env.VITE_STORAGE_LIMIT) || (2 * 1024 * 1024 * 1024);
const APP_NAME = import.meta.env.VITE_APP_NAME || "TeleDrive";

export default function Drive() {
  const { user, signOut } = useAuth();
  const state = useDriveState();
  const {
    view, setView, search, setSearch, loading, setLoading, folders, setFolders,
    files, setFiles, trail, setTrail, selectedIds, setSelectedIds, activeFilter, setActiveFilter,
    searchOpen, setSearchOpen, newFolderOpen, setNewFolderOpen, newFolderName, setNewFolderName,
    renameTarget, setRenameTarget, renameValue, setRenameValue, deleteDialog, setDeleteDialog,
    previewUrl, setPreviewUrl, previewTextContent, setPreviewTextContent, previewFile, setPreviewFile,
    uploads, setUploads, profileOpen, setProfileOpen, securityOpen, setSecurityOpen,
    profileName, setProfileName, profileAvatar, setProfileAvatar, newPassword, setNewPassword,
    profileLoading, setProfileLoading, processingMessage, setProcessingMessage, showPassword, setShowPassword,
    tgSetupOpen, setTgSetupOpen, uploadDialogOpen, setUploadDialogOpen, actionsOpen, setActionsOpen,
    shareLoading, setShareLoading, localIsPublic, setLocalIsPublic,
    moveDialogOpen, setMoveDialogOpen, moveTarget, setMoveTarget,
    allFolders, setAllFolders, viewMode, setViewMode, shareDialogOpen, setShareDialogOpen,
    shareFile, setShareFile, tgToken, setTgToken, botUsername, setBotUsername,
    syncDialogOpen, setSyncDialogOpen,
    localMedia, setLocalMedia, isSyncing, setIsSyncing, totalSize, setTotalSize, stats, setStats,
    sort, setSort, infoItem, setInfoItem, shareUserSearch, setShareUserSearch,
    foundUsers, setFoundUsers, fileShares, setFileShares, searchingUsers, setSearchingUsers,
    notification, setNotification, theme, setTheme,
    fileInputRef, cameraInputRef
  } = state;

  const currentFolder = trail[trail.length - 1] ?? null;
  const notify = ({ title, description, variant }: { title: string; description?: string; variant?: any }) => {
    setNotification({ title, description, variant: variant === 'destructive' ? 'destructive' : 'success', open: true });
  };

  const actions = useDriveActions({ ...state, currentFolder }, user, signOut, notify, STORAGE_LIMIT, MAX_FILE_SIZE);
  const {
    load, loadProfile, updateTelegramSettings, updateProfile, updatePassword, createFolder,
    handleFiles, processUpload, handleReupload, cancelUpload, toggleStar, toggleSoftDelete,
    bulkSoftDelete, emptyTrash, bulkDeletePermanently, renameItem, handleDownload,
    handleMoveItem, bulkMove, getDescendantIds, openFile,
    duplicateFile, duplicateFolder, handleLogout
  } = actions;

  const { onDragStartInternal, onDragOverInternal, onDragLeaveInternal, onDropInternal } = useDriveDragDrop(state, actions, notify);
  const clearSelection = () => setSelectedIds(new Set());

  useShortcuts({
    selectedIds, clearSelection, setSearchOpen, setPreviewUrl, setPreviewFile, 
    setInfoItem, bulkSoftDelete, folders, files, setSelectedIds
  });

  const initials = user?.email?.substring(0, 2).toUpperCase() || "??";

  useEffect(() => {
    if (user) { load(); loadProfile(); }
  }, [user]);

  // Handle Share Settings Sync
  useEffect(() => {
    if (shareDialogOpen && shareFile) {
      setLocalIsPublic(shareFile.is_public);
      actions.fetchFileShares(shareFile.id);
    }
  }, [shareDialogOpen, shareFile]);

  useEffect(() => {
    if (moveDialogOpen && user) {
      supabase.from("folders").select("*").eq("user_id", user.id)
        .then(({ data }) => { if (data) setAllFolders(data as any); });
    }
  }, [moveDialogOpen, user]);

  useEffect(() => {
    load();
  }, [currentFolder, view, sort, search]);

  useEffect(() => {
    if (totalSize > STORAGE_LIMIT) {
      notify({ 
        title: "Penyimpanan Penuh!", 
        description: `Anda telah menggunakan ${formatBytes(totalSize)}, melebihi batas ${formatBytes(STORAGE_LIMIT)}. Silakan hapus beberapa file.`, 
        variant: "destructive" 
      });
    } else if (totalSize > STORAGE_LIMIT * 0.9) {
      notify({ title: "Penyimpanan Hampir Penuh", description: `Penggunaan sudah mencapai ${Math.round((totalSize / STORAGE_LIMIT) * 100)}%.`, variant: "warning" as any });
    }
  }, [totalSize]);


  // Ensure uniqueness to prevent removeChild errors caused by duplicate keys
  const uniqueFiles = Array.from(new Map(files.map(f => [f.id, f])).values());
  
  const filteredFiles = uniqueFiles.filter(f => {
    if (activeFilter === "all") return true;
    if (activeFilter === "folder") return false;
    const m = f.mime_type || "";
    if (activeFilter === "image") return m.startsWith("image/");
    if (activeFilter === "video") return m.startsWith("video/");
    if (activeFilter === "audio") return m.startsWith("audio/");
    if (activeFilter === "document") return m.includes("pdf") || m.includes("doc") || m.includes("xls") || m.includes("ppt") || m.includes("text");
    if (activeFilter === "other") return !m.startsWith("image/") && !m.startsWith("video/") && !m.startsWith("audio/") && !m.includes("pdf") && !m.includes("doc") && !m.includes("xls") && !m.includes("ppt") && !m.includes("text");
    return true;
  });

  const currentFilesSize = filteredFiles.reduce((acc, f) => acc + f.size, 0);
  const recentFiles = [...uniqueFiles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <>
      <div className="min-h-screen bg-background pb-24 md:pb-8 transition-colors duration-300">
        <DriveHeader 
          view={view}
          currentFolder={currentFolder} goBack={() => setTrail(trail.slice(0, -1))}
          APP_NAME={APP_NAME} files={files} folders={folders} filteredFiles={filteredFiles}
          currentFilesSize={currentFilesSize} formatBytes={formatBytes}
          activeFilter={activeFilter} setActiveFilter={setActiveFilter}
          emptyTrash={emptyTrash} viewMode={viewMode} setViewMode={setViewMode}
          searchOpen={searchOpen} setSearchOpen={setSearchOpen} search={search} setSearch={setSearch}
          load={load} sort={sort} setSort={setSort} initials={initials}
          profileName={profileName} user={user} STORAGE_LIMIT={STORAGE_LIMIT}
          totalSize={totalSize} notify={notify} toggleTheme={toggleTheme} theme={theme}
          setProfileOpen={setProfileOpen} setSecurityOpen={setSecurityOpen} handleLogout={handleLogout}
          trail={trail} goBreadcrumb={(i) => setTrail(trail.slice(0, i + 1))}
          onDragOverInternal={onDragOverInternal} onDragLeaveInternal={onDragLeaveInternal} onDropInternal={onDropInternal}
          handleDragOver={(e) => e.preventDefault()} handleDrop={onDropInternal}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block space-y-6">
              <StorageStats stats={stats} totalSize={totalSize} STORAGE_LIMIT={STORAGE_LIMIT} formatBytes={formatBytes} notify={notify} />
              <CategoryNav view={view} activeFilter={activeFilter} setView={setView} setActiveFilter={setActiveFilter} setCurrentFolder={() => setTrail([])} setTrail={setTrail} clearSelection={clearSelection} />
            </aside>

            <div className="lg:col-span-3 space-y-6">
              {/* Simplified rendering to avoid DOM reconciliation issues */}
              {search.trim() ? (
                <PenyimpananView 
                  key="search"
                  view={view} loading={loading} trail={trail} setTrail={setTrail} 
                  selectedIds={selectedIds} setSelectedIds={setSelectedIds} clearSelection={clearSelection} 
                  viewMode={viewMode} setViewMode={setViewMode} sort={sort} setSort={setSort} 
                  activeFilter={activeFilter} folders={folders} filteredFiles={filteredFiles} 
                  openFile={openFile} toggleStar={toggleStar} handleDownload={handleDownload} 
                  setDeleteDialog={setDeleteDialog} toggleSoftDelete={toggleSoftDelete} 
                  setShareFile={setShareFile} setShareDialogOpen={setShareDialogOpen} 
                  setRenameTarget={setRenameTarget} setRenameValue={setRenameValue} 
                  setMoveTarget={setMoveTarget} setMoveDialogOpen={setMoveDialogOpen} 
                  duplicateFile={duplicateFile} duplicateFolder={duplicateFolder} setInfoItem={setInfoItem} 
                  onDragStartInternal={onDragStartInternal} onDragOverInternal={onDragOverInternal} 
                  onDragLeaveInternal={onDragLeaveInternal} onDropInternal={onDropInternal} 
                  formatBytes={formatBytes} emptyTrash={emptyTrash} bulkSoftDelete={bulkSoftDelete} 
                  bulkDeletePermanently={bulkDeletePermanently}
                />
              ) : (
                <>
                  {view === "home" && (
                    <HomeView 
                      key="home"
                      profileName={profileName} user={user} recentFiles={recentFiles} 
                      formatBytes={formatBytes} openFile={openFile} stats={stats} 
                      totalSize={totalSize} STORAGE_LIMIT={STORAGE_LIMIT} 
                      notify={notify} setView={setView} search={search} 
                    />
                  )}

                  {view === "storage" && (
                    <KapasitasView 
                      key="storage"
                      stats={stats} totalSize={totalSize} STORAGE_LIMIT={STORAGE_LIMIT} 
                      formatBytes={formatBytes} notify={notify} tgSetupOpen={tgSetupOpen} 
                      setTgSetupOpen={setTgSetupOpen} tgToken={tgToken} setTgToken={setTgToken} 
                      botUsername={botUsername} setBotUsername={setBotUsername} 
                      updateTelegramSettings={updateTelegramSettings} profileLoading={profileLoading} 
                    />
                  )}

                  {(view === "drive" || view === "starred" || view === "trash") && (
                    <PenyimpananView 
                      key={`view-${view}`}
                      view={view} loading={loading} trail={trail} setTrail={setTrail} 
                      selectedIds={selectedIds} setSelectedIds={setSelectedIds} clearSelection={clearSelection} 
                      viewMode={viewMode} setViewMode={setViewMode} sort={sort} setSort={setSort} 
                      activeFilter={activeFilter} folders={folders} filteredFiles={filteredFiles} 
                      openFile={openFile} toggleStar={toggleStar} handleDownload={handleDownload} 
                      setDeleteDialog={setDeleteDialog} toggleSoftDelete={toggleSoftDelete} 
                      setShareFile={setShareFile} setShareDialogOpen={setShareDialogOpen} 
                      setRenameTarget={setRenameTarget} setRenameValue={setRenameValue} 
                      setMoveTarget={setMoveTarget} setMoveDialogOpen={setMoveDialogOpen} 
                      duplicateFile={duplicateFile} duplicateFolder={duplicateFolder} setInfoItem={setInfoItem} 
                      onDragStartInternal={onDragStartInternal} onDragOverInternal={onDragOverInternal} 
                      onDragLeaveInternal={onDragLeaveInternal} onDropInternal={onDropInternal} 
                      formatBytes={formatBytes} emptyTrash={emptyTrash} bulkSoftDelete={bulkSoftDelete} 
                      bulkDeletePermanently={bulkDeletePermanently}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {view === "drive" && (
          <FloatingActions 
            actionsOpen={actionsOpen} setActionsOpen={setActionsOpen}
            isConnected={!!tgToken}
            fileInputRef={fileInputRef} cameraInputRef={cameraInputRef} 
            setNewFolderOpen={setNewFolderOpen}
            uploads={uploads} setUploadDialogOpen={setUploadDialogOpen} 
            selectedIds={selectedIds} setSelectedIds={setSelectedIds}
            setMoveTarget={setMoveTarget} setMoveDialogOpen={setMoveDialogOpen}
            setDeleteDialog={setDeleteDialog}
          />
        )}

        {/* Dialogs */}
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} profileName={profileName || ""} setProfileName={setProfileName} profileAvatar={profileAvatar} setProfileAvatar={setProfileAvatar} updateProfile={updateProfile} profileLoading={profileLoading} />
        <SecurityDialog open={securityOpen} onOpenChange={setSecurityOpen} notify={notify} showPassword={showPassword} setShowPassword={setShowPassword} newPassword={newPassword} setNewPassword={setNewPassword} updatePassword={updatePassword} profileLoading={profileLoading} />
        <NewFolderDialog open={newFolderOpen} onOpenChange={setNewFolderOpen} newFolderName={newFolderName} setNewFolderName={setNewFolderName} createFolder={createFolder} />
        <UploadProgressSheet open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} uploads={uploads} formatBytes={formatBytes} handleReupload={handleReupload} cancelUpload={cancelUpload} setUploads={setUploads} />
        <MoveDialogSheet open={moveDialogOpen} onOpenChange={setMoveDialogOpen} moveTarget={moveTarget} allFolders={allFolders} currentFolder={currentFolder} selectedIds={selectedIds} handleMoveItem={handleMoveItem} bulkMove={bulkMove} getDescendantIds={getDescendantIds} />
        <InfoSheet infoItem={infoItem} onOpenChange={(o) => setInfoItem(null)} formatBytes={formatBytes} />
        <CloudSetupDialog open={tgSetupOpen} onOpenChange={setTgSetupOpen} botUsername={botUsername} tgToken={tgToken} setTgToken={setTgToken} updateTelegramSettings={updateTelegramSettings} profileLoading={profileLoading} setBotUsername={setBotUsername} loadProfile={loadProfile} />
        <RenameDialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)} renameValue={renameValue} setRenameValue={setRenameValue} handleRename={renameItem} />
        <PreviewDialog file={previewFile} url={previewUrl} onOpenChange={(o) => { if (!o) { setPreviewUrl(null); setPreviewFile(null); } }} textContent={previewTextContent} handleDownload={handleDownload} />
        <NotificationDialog open={notification.open} onOpenChange={(o) => setNotification(prev => ({ ...prev, open: o }))} title={notification.title} description={notification.description} variant={notification.variant} />
        
        <ShareDialog 
          shareDialogOpen={shareDialogOpen} setShareDialogOpen={setShareDialogOpen}
          shareFile={shareFile} formatBytes={formatBytes}
          localIsPublic={localIsPublic} setLocalIsPublic={setLocalIsPublic}
          shareLoading={shareLoading} shareUserSearch={shareUserSearch}
          setShareUserSearch={setShareUserSearch} searchUsers={actions.searchUsers}
          searchingUsers={searchingUsers} foundUsers={foundUsers}
          shareWithUser={actions.shareWithUser} fileShares={fileShares}
          unshareWithUser={actions.unshareWithUser} notify={notify}
          BASE_URL={window.location.origin}
          onSave={(ps, pr) => actions.updateShareSettings(localIsPublic, ps, pr)}
        />

        <DeleteDialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog(prev => ({ ...prev, open: o }))} type={deleteDialog.type} targetName={deleteDialog.target?.name || ""} handleDelete={() => {
          if (deleteDialog.type && deleteDialog.target) {
            if (view === "trash") bulkDeletePermanently();
            else toggleSoftDelete(deleteDialog.target.id, deleteDialog.type);
          }
          setDeleteDialog({ type: null, target: null, open: false });
        }} isTrash={view === "trash"} />

        {processingMessage && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card p-8 rounded-3xl shadow-elegant border border-border/50 flex flex-col items-center gap-4 max-w-xs text-center scale-in">
              <div className="relative"><div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" /><Cloud className="w-6 h-6 text-primary absolute inset-0 m-auto" /></div>
              <div className="space-y-1.5"><p className="font-semibold text-lg text-foreground">Mohon Tunggu</p><p className="text-sm text-muted-foreground leading-relaxed">{processingMessage}</p></div>
            </div>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => handleFiles(e.target.files)} 
          multiple 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={cameraInputRef} 
          onChange={(e) => handleFiles(e.target.files)} 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
        />
      </div>
      <div className="lg:hidden">
        <CategoryNav view={view} activeFilter={activeFilter} setView={setView} setActiveFilter={setActiveFilter} setCurrentFolder={() => setTrail([])} setTrail={setTrail} clearSelection={clearSelection} />
      </div>
    </>
  );
}
