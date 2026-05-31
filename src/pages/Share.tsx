import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatBytes, downloadChunk } from "@/lib/telegram-storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, FileText, AlertCircle, Cloud, User, Lock } from "lucide-react";
import { toast } from "sonner";

interface FileRow {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  is_public: boolean;
  expires_at: string | null;
  share_password?: string | null;
  user_id: string;
  created_at: string;
}

interface ProfileRow {
  display_name: string | null;
  avatar_url: string | null;
}


export default function Share() {
  const { fileId } = useParams();
  function notify(title: string, description: string = "", type: "success" | "error" | "info" = "success") {
    if (type === "error") {
      toast.error(title, { description });
    } else {
      toast.success(title, { description });
    }
  }
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<FileRow | null>(null);
  const [owner, setOwner] = useState<ProfileRow | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputPassword, setInputPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const APP_NAME = import.meta.env.VITE_APP_NAME || "TeleDrive";

  useEffect(() => {
    document.title = APP_NAME;
  }, [APP_NAME]);

  useEffect(() => {
    async function loadSharedFile() {
      if (!fileId) return;
      setLoading(true);
      try {
        // 1. Fetch file data
        const { data: fileData, error: fileError } = await supabase
          .from("files")
          .select("*")
          .eq("id", fileId)
          .single();

        if (fileError) {
          console.error("Supabase Error (Files):", fileError);
          throw new Error(`Gagal memuat data file: ${fileError.message}`);
        }
        
        if (!fileData) throw new Error("File tidak ditemukan.");
        
        // Check if public
        if (!fileData.is_public) {
          throw new Error("File ini bersifat privat dan tidak dibagikan secara publik.");
        }

        // 3. Check expiry
        if (fileData.expires_at && new Date(fileData.expires_at) < new Date()) {
          throw new Error("Link berbagi ini sudah kadaluwarsa.");
        }

        setFile(fileData);

        // 4. Fetch owner profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", fileData.user_id)
          .single();

        if (profileError) {
          console.error("Supabase Error (Profile):", profileError);
          // Don't throw here, maybe we can still show the file name
        }
        
        setOwner(profileData as ProfileRow);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Share Page Error:", error);
        notify("Akses Ditolak", error.message, "error");
      } finally {
        setLoading(false);
      }
    }
    loadSharedFile();
  }, [fileId]);

  async function handleDownload() {
    if (!file) return;

    setDownloading(true);
    setProgress(0);

    try {
      // 1. Fetch chunks for this file
      const { data: chunksData, error: chunksError } = await supabase
        .from("file_chunks")
        .select("id")
        .eq("file_id", file.id)
        .order("created_at", { ascending: true }); // Assuming they are uploaded in order

      if (chunksError || !chunksData || chunksData.length === 0) {
        throw new Error("Gagal menemukan bagian-bagian file di database.");
      }

      console.log(`Starting download for ${file.name} (${chunksData.length} chunks)`);
      const chunks: Blob[] = [];

      for (let i = 0; i < chunksData.length; i++) {
        try {
          // downloadChunk from telegram-storage.ts returns a Blob
          const chunkBlob = await downloadChunk(chunksData[i].id);
          chunks.push(chunkBlob);
          setProgress(Math.round(((i + 1) / chunksData.length) * 100));
        } catch (chunkErr: unknown) {
          const error = chunkErr as Error;
          console.error(`Error downloading chunk ${i}:`, error);
          throw new Error(`Gagal mengunduh bagian ke-${i+1}: ${error.message}`);
        }
      }

      console.log("Reconstructing file...");
      const blob = new Blob(chunks, { type: file.mime_type || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      notify("Berhasil", "File siap diunduh");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Download Error Details:", error);
      notify("Gagal", error.message || "Gagal mengunduh file dari Telegram.", "error");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Memuat file...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6 text-center">
        <Card className="max-w-md w-full p-10 rounded-3xl border-none shadow-elegant">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground text-sm mb-8">File tidak ditemukan atau link sudah kadaluwarsa.</p>
          <Button asChild className="rounded-2xl px-10 h-12">
            <Link to="/">Kembali ke Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Password Protection Screen
  if (file.share_password && !isUnlocked) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6 text-center">
        <Card className="max-w-md w-full p-8 rounded-3xl border-none shadow-elegant">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">File Terkunci</h2>
          <p className="text-muted-foreground text-sm mb-8">Masukkan password untuk mengakses file ini.</p>
          
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="h-12 rounded-xl text-center bg-secondary/50"
              onKeyDown={(e) => e.key === "Enter" && (inputPassword === file.share_password ? setIsUnlocked(true) : notify("Gagal", "Password salah", "error"))}
            />
            <Button 
              onClick={() => inputPassword === file.share_password ? setIsUnlocked(true) : notify("Gagal", "Password salah", "error")}
              className="w-full h-12 rounded-xl font-bold"
            >
              Buka File
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 flex flex-col items-center">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden grid place-items-center shadow-elegant border border-slate-200">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
          {import.meta.env.VITE_APP_NAME || "TeleDrive"}
        </span>
      </div>

      <Card className="max-w-xl w-full overflow-hidden rounded-[32px] shadow-elegant border-none bg-white">
        {/* Header / Preview placeholder */}
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center border-b border-slate-200/50">
          <div className="w-24 h-24 rounded-3xl bg-white shadow-xl grid place-items-center animate-in zoom-in duration-500">
            <FileText className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight truncate" title={file.name}>
              {file.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                {formatBytes(file.size)}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{new Date(file.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Owner Info */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-10 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-200 grid place-items-center shrink-0 border-2 border-white shadow-sm overflow-hidden">
              {owner?.avatar_url ? (
                <img src={owner.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Dibagikan oleh</p>
              <p className="text-base font-bold text-slate-800 truncate">{owner?.display_name || "Pemilik TeleDrive"}</p>
            </div>
          </div>

          <Button 
            onClick={handleDownload}
            disabled={downloading}
            className="w-full h-16 rounded-2xl text-lg font-black shadow-elegant-primary transition-all active:scale-[0.98] relative overflow-hidden"
          >
            {downloading ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mengunduh {progress}%</span>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6" />
                <span>Unduh Sekarang</span>
              </div>
            )}
          </Button>

          <p className="text-center mt-8 text-xs text-slate-400 font-medium leading-relaxed">
            Aman • Terenkripsi • Langsung dari Telegram<br/>
            © 2026 TeleDrive Inc.
          </p>
        </div>
      </Card>

    </div>
  );
}
