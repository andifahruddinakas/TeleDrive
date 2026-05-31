export type Folder = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  is_starred: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
};

export type FileRow = {
  id: string;
  name: string;
  mime_type: string | null;
  size: number;
  thumbnail_data_url: string | null;
  folder_id: string | null;
  created_at: string;
  is_public: boolean;
  expires_at: string | null;
  is_starred: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  share_password?: string | null;
  user_id: string;
};

export type UploadItem = {
  id: string;
  name: string;
  pct: number;
  total: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  file: File;
};
export type StorageStats = {
  image: number;
  video: number;
  audio: number;
  document: number;
  archive: number;
  other: number;
};
