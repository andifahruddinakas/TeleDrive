import { useState, useRef } from "react";
import { Folder, FileRow, UploadItem, StorageStats } from "@/types/drive";

export function useDriveState() {
  const [view, setView] = useState<"home" | "drive" | "starred" | "trash" | "storage">("home");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [trail, setTrail] = useState<Folder[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState("all");
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameTarget, setRenameTarget] = useState<{ kind: "file" | "folder"; id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ type: "file" | "folder" | null; target: FileRow | Folder | null; open: boolean }>({ type: null, target: null, open: false });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTextContent, setPreviewTextContent] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileRow | null>(null);
  const [uploads, setUploads] = useState<Record<string, UploadItem>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [tgSetupOpen, setTgSetupOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [localIsPublic, setLocalIsPublic] = useState(false);
  const [localExpiresAt, setLocalExpiresAt] = useState<string | null>(null);
  const [localPassword, setLocalPassword] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{ kind: "file" | "folder"; ids: string[]; name: string } | null>(null);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareFile, setShareFile] = useState<FileRow | null>(null);
  const [copied, setCopied] = useState(false);
  const [tgToken, setTgToken] = useState("");
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [localMedia, setLocalMedia] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [stats, setStats] = useState<StorageStats>({ image: 0, video: 0, audio: 0, document: 0, archive: 0, other: 0 });
  const [theme, setTheme] = useState<"light" | "dark">(localStorage.getItem("theme") as any || "light");
  const [sort, setSort] = useState<{ field: 'name' | 'size' | 'created_at', order: 'asc' | 'desc' }>({ field: 'created_at', order: 'desc' });
  const [infoItem, setInfoItem] = useState<{ kind: 'file' | 'folder', data: any } | null>(null);
  const [shareUserSearch, setShareUserSearch] = useState("");
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [fileShares, setFileShares] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [notification, setNotification] = useState<{ title: string; description?: string; variant?: "default" | "destructive" | "success" | null; open: boolean }>({ title: "", description: "", variant: null, open: false });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  return {
    view, setView,
    search, setSearch,
    loading, setLoading,
    folders, setFolders,
    files, setFiles,
    trail, setTrail,
    selectedIds, setSelectedIds,
    activeFilter, setActiveFilter,
    searchOpen, setSearchOpen,
    newFolderOpen, setNewFolderOpen,
    newFolderName, setNewFolderName,
    renameTarget, setRenameTarget,
    renameValue, setRenameValue,
    deleteDialog, setDeleteDialog,
    previewUrl, setPreviewUrl,
    previewTextContent, setPreviewTextContent,
    previewFile, setPreviewFile,
    uploads, setUploads,
    profileOpen, setProfileOpen,
    securityOpen, setSecurityOpen,
    profileName, setProfileName,
    profileAvatar, setProfileAvatar,
    newPassword, setNewPassword,
    profileLoading, setProfileLoading,
    processingMessage, setProcessingMessage,
    showPassword, setShowPassword,
    tgSetupOpen, setTgSetupOpen,
    uploadDialogOpen, setUploadDialogOpen,
    actionsOpen, setActionsOpen,
    shareLoading, setShareLoading,
    localIsPublic, setLocalIsPublic,
    localExpiresAt, setLocalExpiresAt,
    localPassword, setLocalPassword,
    moveDialogOpen, setMoveDialogOpen,
    moveTarget, setMoveTarget,
    allFolders, setAllFolders,
    viewMode, setViewMode,
    shareDialogOpen, setShareDialogOpen,
    shareFile, setShareFile,
    copied, setCopied,
    tgToken, setTgToken,
    botUsername, setBotUsername,
    syncDialogOpen, setSyncDialogOpen,
    localMedia, setLocalMedia,
    isSyncing, setIsSyncing,
    totalSize, setTotalSize,
    stats, setStats,
    theme, setTheme,
    sort, setSort,
    infoItem, setInfoItem,
    shareUserSearch, setShareUserSearch,
    foundUsers, setFoundUsers,
    fileShares, setFileShares,
    searchingUsers, setSearchingUsers,
    notification, setNotification,
    fileInputRef,
    cameraInputRef
  };
}
