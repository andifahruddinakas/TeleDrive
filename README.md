# TeleDrive 🚀

TeleDrive adalah aplikasi penyimpanan awan (cloud storage) pribadi yang memanfaatkan infrastruktur Telegram sebagai backend penyimpanan. Simpan file Anda secara gratis, aman, dan tanpa batas ukuran menggunakan Bot Telegram Anda sendiri.

## ✨ Fitur Utama

- **Penyimpanan Telegram**: File disimpan sebagai dokumen di Telegram, memanfaatkan kapasitas penyimpanan Telegram yang luas.
- **Setup Bot Dinamis**: Setiap pengguna dapat menghubungkan Bot Telegram mereka sendiri melalui pengaturan profil.
- **Antarmuka Premium**: Desain modern, responsif, dan interaktif dengan animasi halus dan gaya "SweetAlert".
- **Manajemen File**: Mendukung folder, pencarian, filter berdasarkan kategori file (Gambar, Video, Dokumen, dll), dan ubah nama.
- **Keamanan & Profil**: Ubah nama tampilan dan kata sandi langsung dari aplikasi.
- **Otomatis Aktif**: Pengguna baru langsung aktif dan dapat langsung melakukan setup bot.

## 🛠️ Persiapan & Instalasi

### 1. Prasyarat
- Node.js & npm
- Akun Supabase (untuk Database & Edge Functions)
- Bot Telegram (dibuat via [@BotFather](https://t.me/BotFather))

### 2. Konfigurasi Database
Jalankan SQL berikut di editor SQL Supabase Anda untuk menyiapkan skema:
```sql
-- Jalankan semua file di folder supabase/migrations/
```

### 3. Variabel Lingkungan (.env)
Buat file `.env` di root proyek:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Menjalankan Aplikasi
```bash
npm install
npm run dev
```

## 🤖 Cara Menghubungkan Telegram

1. Buka aplikasi dan Login/Daftar.
2. Ikuti panduan **Setup Telegram** yang muncul otomatis.
3. Masukkan **Bot Token** dari BotFather.
4. Masukkan **Chat ID** (Gunakan [@userinfobot](https://t.me/userinfobot) dengan meneruskan pesan dari grup bot Anda).
5. Mulai unggah file!

---
*Dibuat dengan ❤️ untuk manajemen file yang lebih cerdas.*
