// Simple function to upload file to Telegram
// Accepts base64 encoded file and returns telegram_file_id
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-file-name, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("SUPABASE credentials not configured");
    }

    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user-specific Telegram settings from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("telegram_bot_token, telegram_chat_id")
      .eq("user_id", userData.user.id)
      .single();

    const TELEGRAM_BOT_TOKEN = profile?.telegram_bot_token || Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = profile?.telegram_chat_id || Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return new Response(JSON.stringify({ error: "Telegram bot not configured. Please setup in Settings." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    let binaryData: Uint8Array | null = null;
    let finalFilename = "file.bin";

    const contentType = req.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);

    if (contentType.toLowerCase().includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      finalFilename = formData.get("filename") as string || file?.name || "file.bin";
      if (!file) throw new Error("Missing file in FormData");
      binaryData = new Uint8Array(await file.arrayBuffer());
    } else {
      const body = await req.json();
      const { file_content, filename } = body;
      if (!file_content) throw new Error("Missing file_content");
      finalFilename = filename || "file.bin";
      
      const binaryString = atob(file_content);
      binaryData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        binaryData[i] = binaryString.charCodeAt(i);
      }
    }

    if (!binaryData) throw new Error("Failed to process binary data");

    // Upload to Telegram
    const form = new FormData();
    form.append("chat_id", TELEGRAM_CHAT_ID);
    form.append("document", new Blob([binaryData]), finalFilename);

    console.log(`Uploading ${finalFilename} to Telegram chat ${TELEGRAM_CHAT_ID}...`);
    
    const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
      method: "POST",
      body: form,
    });

    const tgJson = await tgRes.json();
    if (!tgRes.ok || !tgJson.ok) {
      throw new Error(`Telegram Error: ${tgJson.description || tgRes.statusText || "Unknown error"}`);
    }

    const msg = tgJson.result;
    
    // Telegram might reclassify files (e.g., .webp becomes a sticker, .mp4 becomes a video)
    const media = msg.document || msg.sticker || msg.video || msg.audio || msg.voice || (msg.photo ? msg.photo[msg.photo.length - 1] : null);
    
    if (!media || !media.file_id) {
      console.error("No recognizable media in Telegram response:", JSON.stringify(tgJson));
      throw new Error(`Gagal mendapatkan File ID dari Telegram. Response: ${JSON.stringify(tgJson)}`);
    }

    return new Response(
      JSON.stringify({
        telegram_file_id: media.file_id,
        telegram_message_id: msg.message_id,
        size: media.file_size ?? binaryData.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("Function error:", e);
    const message = e.message || String(e);
    // Determine status code: 400 for user-facing errors, 500 for unexpected crashes
    const status = (message.includes("Telegram Error") || message.includes("not configured")) ? 400 : 500;
    
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
