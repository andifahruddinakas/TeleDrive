import React from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrashBannerProps {
  emptyTrash: () => void;
}

export const TrashBanner: React.FC<TrashBannerProps> = ({ emptyTrash }) => {
  return (
    <div className="relative overflow-hidden mb-8 group">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-rose-400/5 rounded-full blur-2xl" />

      <div className="relative bg-white/40 backdrop-blur-xl border border-rose-100 dark:border-rose-900/30 p-5 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-[0_8px_30px_rgb(225,29,72,0.08)]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 grid place-items-center shadow-lg shadow-rose-500/30 transition-transform group-hover:scale-105 duration-300">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full grid place-items-center shadow-sm border border-zinc-100">
              <AlertCircle className="w-3 h-3 text-rose-600" />
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-md font-extrabold text-zinc-900 tracking-tight dark:text-zinc-100">Folder Sampah</h3>
            <p className="text-xs text-zinc-500 font-medium max-w-[300px] leading-relaxed">
              Data akan tersimpan aman di sini sebelum dihapus permanen.
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={emptyTrash}
          className="w-full sm:w-auto rounded-lg px-6 h-10 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 bg-rose-600 border-none"
        >
          Kosongkan
        </Button>
      </div>
    </div>
  );
};
