import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Drive from "./Drive";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <Drive />;
};

export default Index;
