import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-file-name, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = (Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY"))!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // --- LOGIKA DUPLIKASI (FORWARD) ---
    // Cek apakah ini permintaan duplikasi (JSON) atau unggahan (Binary)
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const { message_id } = await req.json();
      if (message_id) {
         const { data: profile } = await supabase.from("profiles").select("telegram_bot_token, telegram_chat_id").eq("user_id", user.id).single();
         const botToken = profile?.telegram_bot_token || TELEGRAM_API_KEY;
         const chatId = profile?.telegram_chat_id || TELEGRAM_CHAT_ID;

         const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/forwardMessage`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             chat_id: chatId,
             from_chat_id: chatId,
             message_id: message_id,
             disable_notification: true,
           }),
         });
         const tgJson = await tgRes.json();
         if (!tgJson.ok) throw new Error(tgJson.description || "Forward failed");
         
         return new Response(JSON.stringify({ new_message_id: tgJson.result.message_id, ok: true }), { 
           status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } 
         });
      }
    }

    // --- LOGIKA UNGGAH ASLI ---
    const filename = req.headers.get("x-file-name") || "chunk.bin";
    const bytes = new Uint8Array(await req.arrayBuffer());
    if (bytes.byteLength === 0) throw new Error("Empty body");

    const form = new FormData();
    form.append("chat_id", TELEGRAM_CHAT_ID!);
    form.append("disable_notification", "true");
    form.append("document", new Blob([bytes], { type: "application/octet-stream" }), filename);

    const tgRes = await fetch(`${GATEWAY_URL}/sendDocument`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY!,
      },
      body: form,
    });
    const tgJson = await tgRes.json();
    if (!tgRes.ok || !tgJson.ok) throw new Error("Telegram upload failed");

    const msg = tgJson.result;
    return new Response(JSON.stringify({
      telegram_file_id: msg.document.file_id,
      telegram_message_id: msg.message_id,
      size: msg.document.file_size ?? bytes.byteLength,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
