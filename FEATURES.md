# Fitur Utama TeleDrive

TeleDrive adalah aplikasi manajemen file (Cloud Storage) berbasis web dan mobile yang memanfaatkan infrastruktur Telegram sebagai backend penyimpanan. Berikut adalah daftar fitur lengkap yang tersedia:

## 📂 Manajemen File & Folder
*   **Upload File Tanpa Batas**: Mengunggah file ke cloud dengan sistem chunking (pemecahan file) otomatis untuk mendukung file berukuran besar.
*   **Manajemen Folder**: Membuat, mengganti nama, dan memindahkan folder secara bertingkat (nested folders).
*   **Drag & Drop Upload**: Mendukung unggah file dengan cara menyeret file dari komputer langsung ke browser.
*   **Advanced Preview**: Pratinjau langsung untuk Gambar, Video, Audio, PDF, dan file teks (TXT, MD, JSON, JS, TS) tanpa perlu mengunduh.
*   **Quick Actions**: Tombol unduh cepat yang muncul saat kursor berada di atas file (mode Grid).
*   **Drag & Drop Internal (Advanced)**: Pindahkan satu atau banyak file sekaligus ke dalam folder atau **Breadcrumbs** (jalur navigasi) di bagian atas untuk navigasi yang lebih cepat.
*   **Duplicate Item**: Salin file atau folder secara instan tanpa perlu mengunggah ulang (memanfaatkan ID file Telegram).
*   **Context Menu**: Akses cepat ke fungsi manajemen melalui klik kanan (*right-click*) layaknya aplikasi desktop profesional.
*   **Mode Tampilan**: Beralih antara tampilan **Grid** (Ikon besar) dan **List** (Daftar detail).
*   **Pengurutan (Sorting)**: Mengurutkan file berdasarkan Nama, Ukuran, atau Tanggal unggah.
*   **Pencarian Cepat**: Menemukan file atau folder secara instan melalui kolom pencarian.
*   **Kategori Otomatis**: Memfilter file berdasarkan jenis (Gambar, Video, Audio, Dokumen, Arsip, Folder).

## 🤝 Berbagi & Kolaborasi
*   **Berbagi Publik**: Membuat link berbagi yang bisa diakses siapa saja dengan opsi:
    *   **Password Protection**: Mengunci file dengan kata sandi.
    *   **Expiration Date**: Link yang otomatis kedaluwarsa dalam waktu tertentu.
*   **Berbagi Privat (Antar Akun)**: Berbagi file secara khusus ke pengguna TeleDrive lain melalui email atau nama pengguna.
*   **Pencarian Pengguna**: Mencari pengguna lain di sistem secara aman melalui Database RPC.

## 🛡️ Keamanan & Privasi
*   **Sistem Kunci (App Lock)**: Mengunci aplikasi menggunakan PIN atau **Biometric Authentication** (Sidik Jari/Face ID).
*   **Tempat Sampah (Trash)**: File yang dihapus tidak langsung hilang, melainkan masuk ke Sampah untuk dapat dipulihkan kembali.
*   **Starred/Favorite**: Menandai file atau folder penting agar mudah ditemukan di tab khusus.
*   **Bot Pribadi**: Pengguna menggunakan Bot Telegram sendiri untuk keamanan data maksimal (data Anda ada di server Anda sendiri).

## 📱 Fitur Mobile (Android)
*   **Aplikasi Native**: Mendukung instalasi di Android dengan performa tinggi.
*   **Native Sharing**: Mendukung fitur "Share to TeleDrive" langsung dari galeri atau aplikasi lain.
*   **Biometric Support**: Integrasi penuh dengan sensor keamanan smartphone.

## ⚡ Performa & Optimasi
*   **Storage Statistics & Status**: Analisis penggunaan ruang penyimpanan berdasarkan kategori file dan indikator kapasitas di menu akun.
*   **Bulk Actions & Selection**: Melakukan tindakan massal (pindah, hapus, bintang) pada banyak file sekaligus dengan sistem seleksi yang cerdas.
*   **Offline Cache**: Sinkronisasi data profil untuk akses lebih cepat.
