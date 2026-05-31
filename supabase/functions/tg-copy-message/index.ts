import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req) => {
  // 1. Respon OPTIONS super-permisif
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = (Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY"))!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { message_id } = await req.json();
    if (!message_id) throw new Error("message_id required");

    // Ambil token dari profil atau env
    const { data: profile } = await supabase
      .from("profiles")
      .select("telegram_bot_token, telegram_chat_id")
      .eq("user_id", user.id)
      .single();

    const botToken = profile?.telegram_bot_token || Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = profile?.telegram_chat_id || Deno.env.get("TELEGRAM_CHAT_ID");

    if (!botToken || !chatId) throw new Error("Bot belum dikonfigurasi");

    // 2. Gunakan forwardMessage seperti saran Anda (lebih stabil)
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
    if (!tgJson.ok) throw new Error(tgJson.description || "Telegram forward failed");

    return new Response(
      JSON.stringify({ new_message_id: tgJson.result.message_id, ok: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { 
        status: 200, // Tetap return 200 agar CORS tidak komplain, tapi isi body adalah error
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
