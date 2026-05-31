// Deletes Telegram messages associated with a file, then deletes the DB row.
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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = (Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY"))!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch user settings from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("telegram_bot_token, telegram_chat_id")
      .eq("user_id", userData.user.id)
      .single();

    const TELEGRAM_BOT_TOKEN = profile?.telegram_bot_token || Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = profile?.telegram_chat_id || Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
       return new Response(JSON.stringify({ error: "Telegram bot not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { file_id } = await req.json().catch(() => ({}));
    if (!file_id) {
      return new Response(JSON.stringify({ error: "file_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // RLS scopes to current user
    // Fetch all chunks for this file
    const { data: chunks } = await supabase
      .from("file_chunks")
      .select("telegram_message_id")
      .eq("file_id", file_id);

    // Strict delete on Telegram: Only delete from Cloud if NO OTHER record is using this message
    let cloudFailures = 0;
    for (const c of chunks ?? []) {
      if (!c.telegram_message_id) continue;
      
      // Check if this message is used by other files
      const { count } = await supabase
        .from("file_chunks")
        .select("*", { count: "exact", head: true })
        .eq("telegram_message_id", c.telegram_message_id)
        .neq("file_id", file_id);

      if (count && count > 0) {
        console.log(`Skipping Telegram deletion for message ${c.telegram_message_id} because it's used by ${count} other files.`);
        continue;
      }

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, message_id: c.telegram_message_id }),
        });
        const tgData = await tgRes.json();
        
        if (!tgData.ok) {
          const isIgnorable = tgData.description?.includes("message to delete not found") || 
                             tgData.description?.includes("message can't be deleted");
          if (!isIgnorable) {
            cloudFailures++;
          }
        }
      } catch (err) {
        cloudFailures++;
      }
    }

    if (cloudFailures > 0 && (chunks?.length || 0) > 0) {
      return new Response(JSON.stringify({ 
        error: "Gagal menghapus file di Telegram Cloud. Database tidak akan dihapus agar Anda bisa mencoba lagi.",
        details: `${cloudFailures} chunks failed to delete.`
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Only if cloud deletion is "clean" (or ignorable) do we delete from DB
    const { error: delErr } = await supabase.from("files").delete().eq("id", file_id);
    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
