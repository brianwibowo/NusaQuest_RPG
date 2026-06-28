# Komunikasi dengan Klien

## Utama

Klien setuju dengan rancangan website saat ini. Menurut mereka, website yang sekarang sudah merepresentasikan keinginan mereka hingga pengembangan **Tahun Ke-2 (maksimal)**.

Website juga sudah **responsif** dan memang utamanya digunakan melalui perangkat **mobile**.

Masukan utama dari klien hanya pada bagian visual, yaitu warna-warna pada website masih perlu dieksplorasi lagi agar lebih menarik namun tetap nyaman dilihat dan tidak terlalu mencolok, karena saat ini tampilan masih didominasi warna putih.

---

## Tambahan yang Menjadi Utama

### 1. Role Pengguna

Website kini memiliki **3 role**, yaitu:

* **Super Admin** (Programmer)
* **Admin** (Klien)
* **User** (Semua orang)

Perbedaan Super Admin dan Admin hanya terletak pada proses assign akun Admin.

* Super Admin dapat membuat (assign) akun Admin.
* Admin tidak dapat membuat Super Admin maupun Admin lainnya.
* Super Admin hanya berjumlah **1 akun**.

---

### 2. Autentikasi

Kedepannya autentikasi menggunakan **akun Google** saja untuk User.

Mekanismenya sebagai berikut:

* Jika pengguna login menggunakan akun Google, maka otomatis menjadi **User**.
* Suatu akun Google hanya menjadi **Admin** apabila akun email tersebut telah di-assign menjadi Admin melalui pengaturan oleh Admin yang sudah ada.

---

### 3. Panel Admin

Akan ada **Panel Admin**, dan ini menjadi perubahan terbesar pada sistem.

Panel Admin akan muncul pada halaman onboarding dalam bentuk tombol apabila akun yang sedang login memang memiliki role Admin.

Secara sederhana, website akan dibuat **sefleksibel mungkin**.

Admin dapat melakukan:

* CRUD Lagu *(lagu saat ini tetap menggunakan data dummy, maksimal 2 lagu).*
* CRUD data **Sejarah**, **Budaya**, **Kuliner**, dan **Ecowisata**. Data tersebut juga diharapkan muncul pada **Maps**.

  * *Opsional:* apabila penentuan titik lokasi dirasa sulit, Admin dapat menginput lokasi menggunakan **longitude** dan **latitude** dari Google Maps.
* CRUD **Misi** pada setiap elemen wisata (Sejarah, Budaya, Kuliner, dan Ecowisata), meliputi:

  * Menentukan isi misi, seperti deskripsi, waktu, tingkat kesulitan, jumlah hadiah (EXP dan Points), serta bonus item (Badge dan Story).
  * Membuat lebih dari satu tujuan/checklist pada setiap misi beserta metode validasi untuk masing-masing checklist.
  * Menentukan misi tersebut tersedia pada level berapa saja (misalnya Level 1, Level 2, dan seterusnya).
* Melihat seluruh akun Admin dan seluruh User.
* CRUD Cerita.
* CRUD UMKM Lokal.
* Melihat peringkat (seperti implementasi saat ini).
* Bagian Hadiah tetap menggunakan data dummy karena merupakan pengembangan pada **Tahun Ke-3**.
* Dari seluruh elemen wisata, **Ecowisata/Lingkungan menjadi poin utama dan prioritas pertama**.

---

# Notes

Keseluruhan perubahan ini bertujuan agar website menjadi **fleksibel**, sehingga ke depannya tidak memerlukan banyak perubahan kode (coding) ketika ada perubahan data atau konten.

Kode juga diharapkan tetap:

* Bersih (*clean code*)
* Modular
* Maintainable

Seluruh komponen di atas wajib selesai hingga target pengembangan **Tahun Ke-2**.

Metode yang saat ini dibuat sudah sangat benar, hanya saja terdapat beberapa penyesuaian seperti yang dijelaskan di atas.

Kemudian, ini juga ada kaitannya dengan asset, karena nanti dari admin bebas mau nentuin dimana aja letak tempatnya, bisa aja di Semarang/Bandung, maka dibuat web panel admin se-fleksibel itu. Nantinya di pemilihan karakter juga ada tombol untuk panduan web ya.
Lalu, ini ada kaitannya dengan asset, disini karena webnya fleksibel, maka mau tidak mau ya wisata terbaru atau semacamnya yang ditambahkan setelah yang kita buat ini tuh pada nyari fotonya sendiri/manual upload ya. Nah, tapi untuk asset di folder characters, rewards, stories, dan UI akan terus digunakan saja.