// Streams one chunk back to the client by Telegram file_id.
// The client must own the chunk (verified via RLS lookup).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-file-name, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    let TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    let userId: string | null = null;

    const { chunk_id } = await req.json().catch(() => ({}));
    if (!chunk_id) {
      return new Response(JSON.stringify({ error: "chunk_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create a service client for internal checks
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY!, {
      auth: { persistSession: false }
    });

    // 2. Resolve the chunk and check if it belongs to a public file
    const { data: chunkInfo, error: chunkInfoErr } = await adminClient
      .from("file_chunks")
      .select("*, files(*)")
      .eq("id", chunk_id)
      .single();

    if (chunkInfoErr || !chunkInfo) {
      return new Response(JSON.stringify({ error: "Chunk not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const file = chunkInfo.files;
    const isPublic = file?.is_public && (!file?.expires_at || new Date(file.expires_at) > new Date());

    if (authHeader) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (!userErr && userData.user) {
        userId = userData.user.id;
      }
    }

    // Access logic: either owner (logged in) or public link
    const isOwner = userId && userId === file?.user_id;

    if (!isOwner && !isPublic) {
      return new Response(JSON.stringify({ error: "Unauthorized access to this chunk" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Fetch bot token for the owner
    const { data: profile } = await adminClient
      .from("profiles")
      .select("telegram_bot_token")
      .eq("user_id", file.user_id)
      .single();

    TELEGRAM_BOT_TOKEN = profile?.telegram_bot_token || TELEGRAM_BOT_TOKEN;

    if (!TELEGRAM_BOT_TOKEN) {
      return new Response(JSON.stringify({ 
        error: "Telegram bot not configured", 
        message: "Bot token is missing in both user profile and server environment." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chunk = chunkInfo;

    // 1) Resolve file_path using official Telegram API
    const fileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${chunk.telegram_file_id}`);
    const fileJson = await fileRes.json();
    if (!fileRes.ok || !fileJson.ok) {
      return new Response(
        JSON.stringify({ error: "getFile failed", details: fileJson }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const filePath = fileJson.result.file_path;

    // 2) Stream the binary back from Telegram
    const dlRes = await fetch(`https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`);
    if (!dlRes.ok) {
      const txt = await dlRes.text();
      return new Response(
        JSON.stringify({ error: "Download failed", status: dlRes.status, details: txt }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(dlRes.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
