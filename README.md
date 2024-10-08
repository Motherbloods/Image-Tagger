# Aplikasi Unggah dan Edit Gambar

Aplikasi ini memungkinkan pengguna untuk mengunggah gambar, secara otomatis mengedit dengan menambahkan cap waktu, dan mengunduh gambar yang telah diedit. Untuk unggahan banyak gambar, aplikasi akan membuat file zip yang berisi semua gambar yang telah diedit.

## Fitur

- Unggah satu atau banyak gambar
- Pengeditan gambar otomatis: menambahkan cap waktu ke setiap gambar
- Unduh gambar yang telah diedit secara individual
- Unduh massal gambar yang telah diedit dalam bentuk file zip (untuk lebih dari 2 gambar)
- Lihat gambar yang diunggah dan diedit di halaman utama

## Alur Aplikasi

```
1. Pengguna mengakses halaman utama (/)
   |
   v
2. Pengguna memilih gambar untuk diunggah
   |
   v
3. Pengguna mengirim formulir (/upload)
   |
   v
4. Server memproses unggahan
   |
   v
5. Untuk setiap gambar:
   a. Baca file gambar
   b. Edit gambar (tambahkan cap waktu)
   c. Simpan gambar yang telah diedit
   |
   v
6. Jika 2 gambar atau kurang:
   a. Hapus gambar asli
   b. Alihkan ke halaman utama
   |
   v
7. Jika lebih dari 2 gambar:
   a. Buat file zip dengan semua gambar yang telah diedit
   b. Hapus gambar asli dan gambar individual yang telah diedit
   c. Alihkan ke halaman utama
   |
   v
8. Halaman utama menampilkan semua gambar yang diunggah/diedit
   |
   v
9. Pengguna dapat mengunduh gambar individual atau file zip
```

## Persiapan dan Menjalankan Aplikasi

1. Instal dependensi:
   ```
   npm install
   ```

2. Jalankan server:
   ```
   node app.js
   ```

3. Akses aplikasi di `http://localhost:3000`

## Dependensi

- Express.js: Kerangka kerja aplikasi web
- Multer: Menangani unggahan file
- Jimp: Pemrosesan gambar
- EJS: Mesin templating
- Archiver: Membuat file zip

## Struktur File

- `app.js`: File aplikasi utama dengan logika server
- `index.ejs`: Template halaman utama
- `uploads/`: Direktori untuk menyimpan gambar yang diunggah dan diedit

## Catatan

- Aplikasi secara otomatis mengganti nama file yang diunggah untuk menghindari konflik
- Gambar yang diedit ditambahkan cap waktu
- Untuk lebih dari 2 gambar, file zip dibuat untuk unduhan massal

