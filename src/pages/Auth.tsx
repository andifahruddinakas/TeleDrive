import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/PasswordInput";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, AlertTriangle, Info, Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const { user, loading } = useAuth();
  function notify({ title, description, variant }: { title: string; description?: string; variant?: string }) {
    if (variant === "destructive") {
      toast.error(title, { description });
    } else {
      toast.success(title, { description });
    }
  }
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const APP_NAME = import.meta.env.VITE_APP_NAME || "TeleDrive";

  useEffect(() => {
    document.title = APP_NAME;
  }, [APP_NAME]);

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        
        if (data?.user) {
          // Explicitly insert profile and registration data
          const user_id = data.user.id;
          const name = displayName || email.split("@")[0];
          
          await Promise.all([
            supabase.from("profiles").upsert({
              user_id,
              display_name: name,
              email: email
            }),
            supabase.from("user_registrations").insert({
              user_id,
              email,
              display_name: name,
              status: import.meta.env.VITE_AUTO_APPROVE === 'true' ? "approved" : "pending_confirmation"
            })
          ]);
        }

        notify({ title: "Akun dibuat", description: "Silakan masuk dengan akun baru Anda." });
        setMode("signin");
        setPassword(""); // Clear password for security
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      notify({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft p-4" translate="no">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-card rounded-[32px] border-none overflow-hidden">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-elegant mb-6 border border-border/40 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2"><span>{APP_NAME}</span></h1>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${mode === "signin" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${mode === "signup" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar</span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nama Anda" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email
              </Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="anda@email.com" />
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="Minimal 6 karakter"
            />
            <Button type="submit" disabled={busy} variant="hero" className="w-full flex items-center justify-center gap-2">
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  {mode === "signin" ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Buat Akun</span>
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
