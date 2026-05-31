import React from "react";
import { 
  FileText, Image as ImageIcon, Video, Music, Archive, File, 
  Folder as FolderIcon 
} from "lucide-react";

interface FileIconProps {
  mime?: string;
  isFolder?: boolean;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ mime, isFolder, className }) => {
  if (isFolder) return <FolderIcon className={className} />;
  
  if (mime?.startsWith("image/")) return <ImageIcon className={className} />;
  if (mime?.startsWith("video/")) return <Video className={className} />;
  if (mime?.startsWith("audio/")) return <Music className={className} />;
  if (mime === "application/zip" || mime?.includes("archive") || mime?.includes("compressed")) return <Archive className={className} />;
  if (mime?.startsWith("text/") || mime === "application/pdf") return <FileText className={className} />;
  
  return <File className={className} />;
};

export const fileIconColor = (mime?: string) => {
  if (mime?.startsWith("image/")) return "text-emerald-500 bg-emerald-500/10";
  if (mime?.startsWith("video/")) return "text-rose-500 bg-rose-500/10";
  if (mime?.startsWith("audio/")) return "text-violet-500 bg-violet-500/10";
  if (mime?.startsWith("text/") || mime === "application/pdf") return "text-amber-500 bg-amber-500/10";
  if (mime?.includes("zip") || mime?.includes("archive")) return "text-zinc-500 bg-zinc-500/10";
  return "text-blue-500 bg-blue-500/10";
};
