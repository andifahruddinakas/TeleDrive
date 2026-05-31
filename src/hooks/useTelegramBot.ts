/**
 * Hook untuk manage Telegram bot connection status
 * Bot token di-load dari .env (VITE_TELEGRAM_BOT_TOKEN)
 */
export function useTelegramBot() {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || null
  const isConnected = !!botToken

  return {
    botToken,
    isConnected,
    loading: false,
    connectBot: () => {
      console.warn('Bot token harus di-set di .env file')
      return false
    },
    disconnectBot: () => {
      console.warn('Bot token harus di-set di .env file')
      return false
    },
  }
}
