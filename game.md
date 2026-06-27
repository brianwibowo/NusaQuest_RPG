# Panduan Uji Coba (Testing Guide) — NusaQuest RPG

Dokumen ini berisi panduan langkah-demi-langkah bagi Anda dan Klien untuk menguji seluruh fungsionalitas game dan antarmuka (UI) **NusaQuest RPG** (Tahap 1 — Konsep Prototype Jakarta).

---

## 1. Persiapan Awal
Jalankan aplikasi di komputer lokal Anda:
1. Pastikan dependensi terinstal: `npm install`
2. Jalankan server dev: `npm run dev`
3. Buka URL yang tertera di terminal (biasanya `http://localhost:5173`) pada browser Anda.

---

## 2. Alur Pengujian Game (Gameplay Loop)

### Langkah 1: Registrasi & Pemilihan Karakter (Onboarding)
*   **Tujuan:** Menguji pembuatan akun baru dan pemilihan role RPG.
*   **Langkah:**
    1. Anda akan disambut oleh halaman selamat datang.
    2. Masukkan nama petualang Anda (misal: "Wira Nusa").
    3. Klik **Pilih Karakter**.
    4. Klik pada masing-masing dari 7 Karakter RPG (Explorer, Cultural Guardian, Culinary Hunter, dll.) untuk melihat ringkasan deskripsi dan **Kekuatan Khusus** masing-masing.
    5. Pilih salah satu karakter yang Anda sukai, lalu klik **Mulai Petualangan**.

### Langkah 2: Eksplorasi Peta Wisata (Explore Map)
*   **Tujuan:** Menguji integrasi Leaflet Map dan marker lokasi wisata.
*   **Langkah:**
    1. Pada Beranda, klik tombol **Jelajahi Peta** di bagian Aksi Cepat (atau klik ikon Peta di navigasi bawah).
    2. Anda akan melihat peta kota Jakarta dengan marker biru di berbagai destinasi penting (Kota Tua, Monas, Setu Babakan, Ragunan, PIK Mangrove, dll.).
    3. Gunakan filter di bagian atas (Sejarah, Budaya, Kuliner, Eco) untuk mem-filter marker di peta.
    4. Klik pada salah satu marker (misalnya **Setu Babakan**).
    5. Popup akan muncul menampilkan info singkat lokasi. Klik tombol **Lihat Misi** untuk diarahkan ke daftar quest.

### Langkah 3: Memulai Misi (Quest System)
*   **Tujuan:** Menguji sistem Quest aktif dan target objektif.
*   **Langkah:**
    1. Buka menu **Misi** (ikon Pedang di navigasi bawah).
    2. Pilih salah satu misi yang bertanda "Tersedia", misalnya **Jejak Batavia: Rahasia Kota Tua** atau **Warisan Betawi: Budaya yang Hidup**.
    3. Klik card misi tersebut untuk melihat detail misi, daftar objektif, dan hadiah (XP & Points).
    4. Klik tombol **Mulai Misi**. Misi sekarang berstatus "Aktif" dan muncul di halaman Beranda Anda.

### Langkah 4: Menyelesaikan Objektif & Battle (Challenge System)
*   **Tujuan:** Menguji interaktivitas kuis edukasi (Knowledge Battle).
*   **Langkah:**
    1. Di dalam halaman detail misi aktif, Anda akan melihat checklist objektif.
    2. Untuk objektif manual (seperti mengunjungi lokasi atau foto spot), Anda bisa mencentang kotak checklist secara manual.
    3. Untuk objektif kuis (misal: "Jawab kuis tentang budaya Betawi"), klik tombol kuning **Tantangan** yang muncul.
    4. Modal kuis (Battle Quiz) akan terbuka dengan timer 60 detik.
    5. Jawab pertanyaan pilihan ganda yang tersedia. Setiap selesai menjawab, penjelasan edukasi akan muncul.
    6. Selesaikan kuis dengan nilai kelulusan yang cukup untuk otomatis menyelesaikan objektif kuis tersebut.

### Langkah 5: Level Up & Membuka Hadiah (Rewards & Story Book)
*   **Tujuan:** Menguji sistem perkembangan level, toko poin, dan unlock cerita warisan budaya.
*   **Langkah:**
    1. Setelah seluruh objektif misi selesai, klik **Selesaikan Misi**.
    2. Poin dan XP Anda akan bertambah secara real-time.
    3. Jika XP Anda melampaui batas, notifikasi **Naik Level** (Level Up) akan muncul.
    4. Buka menu **Hadiah** (ikon Tas di navigasi bawah) untuk menukarkan Poin yang terkumpul dengan Voucher Kuliner UMKM Betawi.
    5. Buka Menu Sampingan (ikon hamburger di kiri atas header) -> pilih **Cerita**. Anda akan melihat kisah warisan budaya terkait misi yang baru saja Anda selesaikan kini telah terbuka (unlocked) dan siap dibaca.

---

## 3. Fitur Pendukung untuk Demo
*   **Bilingual (Switch Bahasa):** Klik ikon Globe di kanan atas header untuk mengganti bahasa aplikasi secara instan antara Bahasa Indonesia dan English. Perhatikan seluruh teks misi, kuis, dan peta berubah secara konsisten.
*   **Reset Data:** Jika ingin mengulang presentasi dari awal di depan klien, masuk ke halaman **Profil** -> klik **Reset Permainan** -> konfirmasi reset. Aplikasi akan kembali ke halaman Onboarding awal.
