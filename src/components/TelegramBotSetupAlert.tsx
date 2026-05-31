import { AlertCircle, Settings, Copy } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'

interface TelegramBotSetupAlertProps {
  isConnected?: boolean
}

export function TelegramBotSetupAlert({ isConnected = false }: TelegramBotSetupAlertProps) {
  const [open, setOpen] = useState(!isConnected) // Auto-open jika tidak connected
  const [copied, setCopied] = useState(false)

  // Auto-open dialog saat pertama kali akses jika tidak ada bot token
  useEffect(() => {
    if (!isConnected) {
      setOpen(true)
    }
  }, [isConnected])

  const handleCopy = () => {
    navigator.clipboard.writeText('VITE_TELEGRAM_BOT_TOKEN=')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isConnected) {
    return null
  }

  return (
    <>
      {/* Alert banner */}
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>⚠️ Telegram Bot Belum Terhubung</AlertTitle>
        <AlertDescription className="mt-2 flex items-center justify-between gap-4">
          <span>
            Tambahkan Telegram bot token ke file .env untuk mengaktifkan fitur upload file.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="whitespace-nowrap flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Setup Sekarang
          </Button>
        </AlertDescription>
      </Alert>

      {/* Setup Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>⚙️ Setup Telegram Bot</DialogTitle>
            <DialogDescription>
              Tambahkan bot token ke file .env untuk aktifkan upload file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-3">
              <div>
                  <p className="font-semibold mb-2">📝 Cara Setup Telegram Bot:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Buka Telegram dan cari <code className="bg-white px-1 rounded">@BotFather</code></li>
                    <li>Kirim command <code className="bg-white px-1 rounded">/start</code></li>
                    <li>Kirim <code className="bg-white px-1 rounded">/newbot</code> untuk buat bot baru</li>
                    <li>Ikuti instruksi dan copy bot token</li>
                    <li>Buka bot yang baru dibuat di Telegram</li>
                    <li>Buka link: <code className="bg-white px-1 rounded text-xs break-all">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code></li>
                    <li>Copy chat ID dari response JSON (cari field <code className="bg-white px-1 rounded">"id"</code>)</li>
                  </ol>
                </div>

                <div className="border-t border-blue-300 pt-3">
                  <p className="font-semibold mb-2">⚙️ Add ke .env File:</p>
                  <div className="bg-white rounded p-2 font-mono text-xs space-y-2 max-h-48 overflow-y-auto">
                    <div className="text-gray-500">VITE_SUPABASE_PROJECT_ID=pnbilvxvdryqzarkwbza</div>
                    <div className="text-gray-500">VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...</div>
                    <div className="text-gray-500">VITE_SUPABASE_URL=https://pnbilvxvdryqzarkwbza.supabase.co</div>
                    <div className="text-gray-500">VITE_SUPABASE_SERVICE_KEY=sb_secret_...</div>
                    <div className="bg-yellow-100 px-2 py-1 rounded border border-yellow-300 font-semibold text-yellow-900">
                      VITE_TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
                    </div>
                    <div className="bg-yellow-100 px-2 py-1 rounded border border-yellow-300 font-semibold text-yellow-900">
                      VITE_TELEGRAM_CHAT_ID=-1003725818938
                    </div>
                  </div>
                </div>

                <div className="border-t border-blue-300 pt-3">
                  <p className="text-xs text-blue-800">
                    ℹ️ Ganti TOKEN dengan bot token dari @BotFather, dan CHAT_ID dengan ID dari getUpdates response. Lalu restart development server.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy Template'}
              </Button>
              <Button onClick={() => setOpen(false)} className="flex-1">
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
