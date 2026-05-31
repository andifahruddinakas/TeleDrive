import React from "react";
import {
  Folder as FolderIcon, MoreVertical, Star, Trash2, Download,
  Share2, Edit2, ExternalLink, Copy, Info, RefreshCcw, Check, Plus, Camera, FolderPlus, Cloud, Folders
} from "lucide-react";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator
} from "@/components/ui/context-menu";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileIcon, fileIconColor } from "./FileIcon";

interface FileExplorerProps {
  viewMode: "grid" | "list";
  activeFilter: string;
  view: string;
  folders: any[];
  filteredFiles: any[];
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  openFolder: (f: any) => void;
  handlePreview: (f: any) => void;
  toggleStar: (id: string, current: boolean, kind: 'file' | 'folder') => void;
  downloadFile: (f: any) => void;
  deleteFile: (f: any) => void;
  deleteFolder: (f: any) => void;
  toggleSoftDelete: (id: string, kind: string, restore?: boolean) => void;
  setShareFile: (f: any) => void;
  setShareDialogOpen: (val: boolean) => void;
  setRenameTarget: (val: any) => void;
  setRenameValue: (val: string) => void;
  setMoveTarget: (val: any) => void;
  setMoveDialogOpen: (val: boolean) => void;
  duplicateFile: (f: any) => void;
  duplicateFolder: (f: any) => void;
  setInfoItem: (val: any) => void;
  onDragStartInternal: (e: any, id: string, kind: string) => void;
  onDragOverInternal: (e: any) => void;
  onDragLeaveInternal: (e: any) => void;
  onDropInternal: (e: any, folderId: string | null) => void;
  formatBytes: (bytes: number) => string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  viewMode,
  activeFilter,
  view,
  folders,
  filteredFiles,
  selectedIds,
  toggleSelect,
  openFolder,
  handlePreview,
  toggleStar,
  downloadFile,
  deleteFile,
  deleteFolder,
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
  formatBytes
}) => {
  const isSelected = (id: string) => selectedIds.has(id);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="min-h-[400px]">
          {folders.length === 0 && filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                <Cloud className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Belum ada data</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">Unggah file atau buat folder baru untuk memulai penyimpanan cloud Anda.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {/* Folders Grid */}
              {folders.filter(f => activeFilter === "all" || activeFilter === "folder").map((f) => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={(e) => onDragStartInternal(e, f.id, 'folder')}
                  onDragOver={onDragOverInternal}
                  onDragLeave={onDragLeaveInternal}
                  onDrop={(e) => onDropInternal(e, f.id)}
                  className={`group relative bg-card rounded-2xl transition-all cursor-alias border-2 ${isSelected(f.id) ? "border-primary bg-primary/[0.02] shadow-lg shadow-primary/10" : "border-transparent shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"}`}
                >
                  <div onClick={(e) => { e.stopPropagation(); toggleSelect(f.id); }} className={`absolute top-3 left-3 z-20 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${isSelected(f.id) ? "bg-primary border-primary shadow-lg shadow-primary/40" : "bg-card border-border shadow-sm"}`}>
                    {isSelected(f.id) && <Check className="w-3 h-3 text-white stroke-[4]" />}
                  </div>

                  <div className="absolute top-2 right-2 z-20 flex items-center gap-0.5 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); toggleStar(f.id, f.is_starred, "folder"); }} className={`p-1.5 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm hover:bg-secondary transition-all ${f.is_starred ? "text-yellow-400" : "text-zinc-400"}`}>
                      <Star className={`w-3.5 h-3.5 ${f.is_starred ? "fill-yellow-400" : ""}`} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="w-7 h-7 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm hover:bg-secondary"><MoreVertical className="w-3.5 h-3.5 text-muted-foreground" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-elegant border-none p-1.5">
                        {view === "trash" ? (
                          <>
                            <DropdownMenuItem onClick={() => toggleSoftDelete(f.id, "folder", true)} className="rounded-lg"><RefreshCcw className="w-4 h-4 mr-2.5" /> Pulihkan</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteFolder(f)} className="text-destructive rounded-lg"><Trash2 className="w-4 h-4 mr-2.5" /> Hapus Permanen</DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => { setRenameTarget({ kind: "folder", id: f.id, name: f.name }); setRenameValue(f.name); }} className="rounded-lg"><Edit2 className="w-4 h-4 mr-2.5" /> Ganti Nama</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setMoveTarget({ kind: "folder", ids: [f.id], name: f.name }); setMoveDialogOpen(true); }} className="rounded-lg"><ExternalLink className="w-4 h-4 mr-2.5" /> Pindahkan</DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={() => duplicateFolder(f)} className="rounded-lg"><Copy className="w-4 h-4 mr-2.5" /> Salin</DropdownMenuItem> */}
                            <DropdownMenuItem onClick={() => setInfoItem({ kind: 'folder', data: f })} className="rounded-lg"><Info className="w-4 h-4 mr-2.5" /> Properti</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border my-1" />
                            <DropdownMenuItem onClick={() => toggleSoftDelete(f.id, "folder")} className="text-destructive rounded-lg"><Trash2 className="w-4 h-4 mr-2.5" /> Buang</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div onClick={() => selectedIds.size > 0 ? toggleSelect(f.id) : openFolder(f)} className="p-1">
                    <div className="aspect-square rounded-xl bg-secondary/50 flex items-center justify-center transition-colors group-hover:bg-primary/[0.03] overflow-hidden relative border border-border/40">
                      <div className="relative">
                        {f.item_count > 0 ? (
                          <Folders className="w-16 h-16 text-primary fill-primary/10 transition-transform group-hover:scale-110 duration-500" />
                        ) : (
                          <FolderIcon className="w-16 h-16 text-primary fill-primary/10 transition-transform group-hover:scale-110 duration-500" />
                        )}
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full scale-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <p className="font-bold text-sm truncate text-foreground mb-0.5">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        {f.item_count > 0 ? `${f.item_count} Item` : "Folder"} • {new Date(f.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Files Grid */}
              {filteredFiles.map((f) => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={(e) => onDragStartInternal(e, f.id, 'file')}
                  className={`group relative bg-card rounded-2xl transition-all cursor-pointer border-2 ${isSelected(f.id) ? "border-primary bg-primary/[0.02] shadow-lg shadow-primary/10" : "border-transparent shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"}`}
                >
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <div className="p-1">
                        <div onClick={(e) => { e.stopPropagation(); toggleSelect(f.id); }} className={`absolute top-3 left-3 z-20 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${isSelected(f.id) ? "bg-primary border-primary shadow-lg shadow-primary/40" : "bg-card border-border shadow-sm"}`}>
                          {isSelected(f.id) && <Check className="w-3 h-3 text-white stroke-[4]" />}
                        </div>

                        <div className="absolute top-2 right-2 z-20 flex items-center gap-0.5 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); toggleStar(f.id, f.is_starred, "file"); }} className={`p-1.5 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm hover:bg-secondary transition-all ${f.is_starred ? "text-yellow-400" : "text-zinc-400"}`}>
                            <Star className={`w-3.5 h-3.5 ${f.is_starred ? "fill-yellow-400" : ""}`} />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="w-7 h-7 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm hover:bg-secondary"><MoreVertical className="w-3.5 h-3.5 text-muted-foreground" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-elegant border-none p-1.5">
                              {view === "trash" ? (
                                <>
                                  <DropdownMenuItem onClick={() => toggleSoftDelete(f.id, "file", true)} className="rounded-lg"><RefreshCcw className="w-4 h-4 mr-2.5" /> Pulihkan</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteFile(f)} className="text-destructive rounded-lg"><Trash2 className="w-4 h-4 mr-2.5" /> Hapus Permanen</DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem onClick={() => downloadFile(f)} className="rounded-lg"><Download className="w-4 h-4 mr-2.5" /> Unduh</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setShareFile(f); setShareDialogOpen(true); }} className="rounded-lg"><Share2 className="w-4 h-4 mr-2.5" /> Berbagi</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setRenameTarget({ kind: "file", id: f.id, name: f.name }); setRenameValue(f.name); }} className="rounded-lg"><Edit2 className="w-4 h-4 mr-2.5" /> Ganti Nama</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setMoveTarget({ kind: "file", ids: [f.id], name: f.name }); setMoveDialogOpen(true); }} className="rounded-lg"><ExternalLink className="w-4 h-4 mr-2.5" /> Pindahkan</DropdownMenuItem>
                                  {/* <DropdownMenuItem onClick={() => duplicateFile(f)} className="rounded-lg"><Copy className="w-4 h-4 mr-2.5" /> Salin</DropdownMenuItem> */}
                                  <DropdownMenuItem onClick={() => setInfoItem({ kind: 'file', data: f })} className="rounded-lg"><Info className="w-4 h-4 mr-2.5" /> Properti</DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-border my-1" />
                                  <DropdownMenuItem onClick={() => toggleSoftDelete(f.id, "file")} className="text-destructive rounded-lg"><Trash2 className="w-4 h-4 mr-2.5" /> Buang</DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div onClick={() => selectedIds.size > 0 ? toggleSelect(f.id) : handlePreview(f)}>
                          <div className="aspect-square rounded-xl bg-secondary/50 relative overflow-hidden flex items-center justify-center border border-border/40">
                            {f.thumbnail_data_url ? (
                              <img src={f.thumbnail_data_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                            ) : (
                              <div className="relative">
                                <FileIcon mime={f.mime_type} className={`w-14 h-14 transition-transform group-hover:scale-110 duration-500 ${fileIconColor(f.mime_type).split(" ")[0]}`} />
                                <div className="absolute inset-0 bg-current blur-2xl rounded-full scale-50 opacity-0 group-hover:opacity-10 transition-opacity" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors" />

                            {f.is_public && (
                              <div className="absolute bottom-2 left-2 z-20 w-6 h-6 rounded-lg bg-blue-600 text-white shadow-lg flex items-center justify-center animate-in zoom-in-50 duration-300">
                                <Share2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="p-3 text-center">
                            <p className="font-bold text-sm truncate text-foreground mb-0.5">{f.name}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{formatBytes(f.size)} • {new Date(f.created_at).toLocaleDateString("id-ID")}</p>
                          </div>
                        </div>
                      </div>
                    </ContextMenuTrigger>
                  </ContextMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-border/40 overflow-hidden divide-y divide-border/40">
              {/* Combined List for Mobile/Desktop */}
              {[
                ...folders.filter(f => activeFilter === "all" || activeFilter === "folder").map(f => ({ ...f, kind: 'folder' })),
                ...filteredFiles.map(f => ({ ...f, kind: 'file' }))
              ].map((item: any) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => onDragStartInternal(e, item.id, item.kind)}
                  onDragOver={item.kind === 'folder' ? onDragOverInternal : undefined}
                  onDragLeave={item.kind === 'folder' ? onDragLeaveInternal : undefined}
                  onDrop={item.kind === 'folder' ? (e) => onDropInternal(e, item.id) : undefined}
                  className={`flex items-center gap-3 p-3 transition ${isSelected(item.id) ? "bg-primary/5" : "hover:bg-secondary/40"} ${item.kind === 'folder' ? 'cursor-alias' : ''}`}
                >
                  <div onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }} className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center shrink-0 cursor-pointer ${isSelected(item.id) ? "bg-primary border-primary" : "bg-zinc-100 border-zinc-300"}`}>
                    {isSelected(item.id) && <Check className="w-4 h-4 text-white stroke-[4]" />}
                  </div>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <div onClick={() => selectedIds.size > 0 ? toggleSelect(item.id) : (item.kind === 'folder' ? openFolder(item) : handlePreview(item))} className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                        <div className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${item.kind === 'folder' ? 'bg-primary/10 text-primary' : fileIconColor(item.mime_type)}`}>
                          {item.thumbnail_data_url ? <img src={item.thumbnail_data_url} alt="" className="w-full h-full object-cover rounded-lg" /> : <FileIcon mime={item.mime_type} isFolder={item.kind === 'folder'} className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold truncate">{item.name}</p>
                            {item.kind === 'file' && item.is_public && (
                              <Share2 className="w-3 h-3 text-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{item.kind === 'folder' ? 'Folder' : formatBytes(item.size)} • {new Date(item.created_at).toLocaleDateString("id-ID")}</p>
                        </div>
                        {item.is_starred && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 mr-2" />}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56 rounded-lg shadow-lg border border-border p-1.5">
                      {view === "trash" ? (
                        <>
                          <ContextMenuItem onClick={() => toggleSoftDelete(item.id, item.kind, true)} className="rounded-xl"><RefreshCcw className="w-4 h-4 mr-2.5" /> Pulihkan</ContextMenuItem>
                          <ContextMenuItem onClick={() => { if (item.kind === 'folder') deleteFolder(item); else deleteFile(item); }} className="text-destructive rounded-xl"><Trash2 className="w-4 h-4 mr-2.5" /> Hapus Permanen</ContextMenuItem>
                        </>
                      ) : (
                        <>
                          {item.kind === 'file' && (
                            <>
                              <ContextMenuItem onClick={() => downloadFile(item)} className="rounded-xl"><Download className="w-4 h-4 mr-2.5" /> Unduh</ContextMenuItem>
                              <ContextMenuItem onClick={() => { setShareFile(item); setShareDialogOpen(true); }} className="rounded-xl"><Share2 className="w-4 h-4 mr-2.5" /> Berbagi</ContextMenuItem>
                            </>
                          )}
                          <ContextMenuItem onClick={() => { setRenameTarget({ kind: item.kind, id: item.id, name: item.name }); setRenameValue(item.name); }} className="rounded-xl"><Edit2 className="w-4 h-4 mr-2.5" /> Ganti Nama</ContextMenuItem>
                          <ContextMenuItem onClick={() => { setMoveTarget({ kind: item.kind, ids: [item.id], name: item.name }); setMoveDialogOpen(true); }} className="rounded-xl"><ExternalLink className="w-4 h-4 mr-2.5" /> Pindahkan</ContextMenuItem>
                          <ContextMenuItem onClick={() => item.kind === 'folder' ? duplicateFolder(item) : duplicateFile(item)} className="rounded-xl"><Copy className="w-4 h-4 mr-2.5" /> Salin</ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => toggleSoftDelete(item.id, item.kind)} className="text-destructive rounded-xl"><Trash2 className="w-4 h-4 mr-2.5" /> Buang</ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-secondary"><MoreVertical className="w-4 h-4 text-muted-foreground" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-lg shadow-lg border border-border p-1.5">
                      {view === "trash" ? (
                        <>
                          <DropdownMenuItem onClick={() => toggleSoftDelete(item.id, item.kind, true)} className="rounded-xl"><RefreshCcw className="w-4 h-4 mr-2.5" /> Pulihkan</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { if (item.kind === 'folder') deleteFolder(item); else deleteFile(item); }} className="text-destructive rounded-xl"><Trash2 className="w-4 h-4 mr-2.5" /> Hapus Permanen</DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          {item.kind === 'file' && (
                            <>
                              <DropdownMenuItem onClick={() => downloadFile(item)} className="rounded-xl"><Download className="w-4 h-4 mr-2.5" /> Unduh</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setShareFile(item); setShareDialogOpen(true); }} className="rounded-xl"><Share2 className="w-4 h-4 mr-2.5" /> Berbagi</DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => { setRenameTarget({ kind: item.kind, id: item.id, name: item.name }); setRenameValue(item.name); }} className="rounded-xl"><Edit2 className="w-4 h-4 mr-2.5" /> Ganti Nama</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setMoveTarget({ kind: item.kind, ids: [item.id], name: item.name }); setMoveDialogOpen(true); }} className="rounded-xl"><ExternalLink className="w-4 h-4 mr-2.5" /> Pindahkan</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => item.kind === 'folder' ? duplicateFolder(item) : duplicateFile(item)} className="rounded-xl"><Copy className="w-4 h-4 mr-2.5" /> Salin</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleSoftDelete(item.id, item.kind)} className="text-destructive rounded-xl"><Trash2 className="w-4 h-4 mr-2.5" /> Buang</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 rounded-xl shadow-elegant border-none p-1.5">
        <ContextMenuItem onClick={() => (document.getElementById('floating-upload-input') as any)?.click()} className="rounded-xl"><Plus className="w-4 h-4 mr-2.5" /> Upload File</ContextMenuItem>
        <ContextMenuItem onClick={() => (document.getElementById('floating-camera-input') as any)?.click()} className="rounded-xl"><Camera className="w-4 h-4 mr-2.5" /> Ambil Foto</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => (document.querySelector('[data-new-folder-trigger]') as any)?.click()} className="rounded-xl"><FolderPlus className="w-4 h-4 mr-2.5" /> Folder Baru</ContextMenuItem>
        <ContextMenuItem onClick={() => (document.querySelector('[data-sync-trigger]') as any)?.click()} className="rounded-xl"><RefreshCcw className="w-4 h-4 mr-2.5" /> Sinkron Galeri</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
