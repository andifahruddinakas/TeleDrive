import { supabase } from "@/integrations/supabase/client";

// Telegram bot sendDocument hard limit is 50MB; keep a safety margin for multipart overhead.
const DEFAULT_CHUNK_SIZE = 20 * 1024 * 1024; // 20 MiB
export const CHUNK_SIZE = Number(import.meta.env.VITE_UPLOAD_CHUNK_SIZE) || DEFAULT_CHUNK_SIZE;

export type ChunkUploadResult = {
  telegram_file_id: string;
  telegram_message_id: number;
  size: number;
};

export async function uploadChunk(
  blob: Blob,
  filename: string,
): Promise<ChunkUploadResult> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session?.access_token) {
    throw new Error("Not authenticated");
  }

  try {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("filename", filename);

    if (import.meta.env.VITE_USE_SINGLE_TOKEN === 'true') {
      formData.append("bot_token", import.meta.env.VITE_TELEGRAM_BOT_TOKEN);
      formData.append("chat_id", import.meta.env.VITE_TELEGRAM_CHAT_ID);
    }

    // Call Supabase function with FormData
    const { data, error } = await supabase.functions.invoke("telegram-upload", {
      body: formData,
    });

    if (error) {
      console.error("Supabase Function Error Object:", error);
      let errMsg = error.message;
      
      // Try to extract the detailed error from the response body
      if (error instanceof Error && (error as any).context) {
        try {
          const bodyText = await (error as any).context.text();
          console.log("Raw error body from function:", bodyText);
          try {
            const body = JSON.parse(bodyText);
            if (body.error) errMsg = body.error;
          } catch {
            if (bodyText) errMsg = bodyText;
          }
        } catch (e) {
          console.error("Failed to read error context:", e);
        }
      }
      
      throw new Error(`Upload failed: ${errMsg}`);
    }

    if (!data.telegram_file_id) {
      throw new Error("No file_id returned from upload");
    }

    return {
      telegram_file_id: data.telegram_file_id,
      telegram_message_id: data.telegram_message_id,
      size: data.size,
    };
  } catch (error: any) {
    throw new Error(`Telegram upload error: ${error.message || String(error)}`);
  }
}

export async function downloadChunk(chunkId: string): Promise<Blob> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;

  const body: any = { chunk_id: chunkId };
  if (import.meta.env.VITE_USE_SINGLE_TOKEN === 'true') {
    body.bot_token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  }

  const { data, error } = await supabase.functions.invoke("tg-download-chunk", {
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (error) {
    console.error("Download function error:", error);
    // provide a more human-readable message for 502/Edge function errors
    if (error.message?.includes("non-2xx") || error.message?.includes("502")) {
      throw new Error(`Server Error (502): Gagal mengambil file dari Telegram. Pastikan Bot Token benar dan file belum kedaluwarsa.`);
    }
    throw error;
  }
  // supabase-js returns Blob for binary responses
  if (data instanceof Blob) return data;
  // Fallback: raw fetch
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/tg-download-chunk`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ chunk_id: chunkId }),
    },
  );
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return await res.blob();
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
}

export async function makeImageThumbnail(file: File, max = 240): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  try {
    const bmp = await createImageBitmap(file);
    const ratio = Math.min(max / bmp.width, max / bmp.height, 1);
    const w = Math.round(bmp.width * ratio);
    const h = Math.round(bmp.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bmp, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch { return null; }
}
