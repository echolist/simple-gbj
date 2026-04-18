# SIDIET-BARBER - Sistem Informasi Digital Efisiensi Tempat Tidur Berdasarkan Ebarber

## 📋 Pengenalan

SIDIET-BARBER adalah aplikasi web untuk menganalisis efisiensi penggunaan tempat tidur di rumah sakit menggunakan metode Barber Johnson. Aplikasi ini memvisualisasikan empat indikator utama (BOR, ALOS, TOI, BTO) dalam grafik scatter yang interaktif.

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:
- Node.js (v14 atau lebih baru)
- npm (Node Package Manager)
- Git
- Code editor (Visual Studio Code disarankan)

## 🚀 Cara Install

### Langkah 1: Clone Repository
Buka terminal dan jalankan perintah berikut:
```bash
git clone https://github.com/echolist/simple-gbj.git
cd simple-gbj
```
### Langkah 2: Install Dependencies
Instal semua dependensi yang diperlukan:

```bash
npm install
```
### Langkah 3: Menjalankan Aplikasi

Untuk menjalankan aplikasi dalam mode development:

```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:5173 (atau port yang ditampilkan di terminal)

### Langkah 4: Build untuk Production
Untuk membuat build production:

```bash
npm run build
```
## 📊 Cara Kerja Program
### Input Data
Aplikasi meminta 7 parameter input:
<ol type="a">
  <li>Jumlah Tempat Tidur (Bed Capacity)<br>Jumlah total tempat tidur yang tersedia di unit perawatan</li>
<li>Pasien Keluar Hidup (Discharged Alive)<br>
Jumlah pasien yang keluar dalam kondisi hidup</li>
<li>Pasien Keluar Mati < 48 Jam (Died < 48 Hours)<br>Jumlah pasien yang meninggal dalam waktu kurang dari 48 jam setelah masuk</li>
<li>Pasien Keluar Mati > 48 Jam (Died > 48 Hours)<br>
Jumlah pasien yang meninggal setelah lebih dari 48 jam perawatan</li>

<li>Jumlah Hari Perawatan (Total Days of Care)<br>Total hari pasien dirawat dalam periode tertentu</li>

<li>Lama Dirawat (Length of Stay)<br>Total hari rawat inap dari semua pasien</li>

<li>Periode (Period in Days)<br>Jumlah hari dalam periode observasi (biasanya 30 hari)</li></ol>

### Perhitungan Indikator
Program menghitung 4 indikator utama:

1. BOR (Bed Occupancy Rate) - Persentase Okupansi Tempat Tidur
Code
BOR = (Jumlah Hari Perawatan / (Jumlah Tempat Tidur × Periode)) × 100%
Target ideal: 75-85%
Menunjukkan persentase pemanfaatan tempat tidur
2. ALOS (Average Length of Stay) - Rata-rata Lama Rawat Inap
Code
ALOS = Lama Dirawat / (Pasien Keluar Hidup + Pasien Keluar Mati)
Target ideal: 3-12 hari (tergantung jenis rumah sakit)
Semakin rendah semakin efisien
3. TOI (Turn Over Interval) - Interval Pergantian Tempat Tidur
Code
TOI = ((Jumlah Tempat Tidur × Periode) - Jumlah Hari Perawatan) / Total Pasien Keluar
Target ideal: 1-3 hari
Waktu rata-rata tempat tidur kosong sebelum pasien baru masuk
4. BTO (Bed Turn Over) - Pergantian Pasien per Tempat Tidur
Code
BTO = Total Pasien Keluar / Jumlah Tempat Tidur
Target ideal: 40-50 pasien per tempat tidur per tahun
Menunjukkan produktivitas tempat tidur
### Visualisasi Grafik
Setelah input data dan klik "GENERATE GRAFIK", aplikasi akan menampilkan:

1. Scatter Chart dengan sumbu X (TOI) dan Y (ALOS)
2. Garis Bantu BOR - Ray dari origin dengan nilai BOR 50%, 70%, 75%, 80%, 90%
3. Garis Bantu BTO - Diagonal dengan nilai BTO 12.5, 15, 20, 30
4. Titik RS - Posisi rumah sakit Anda berdasarkan TOI dan ALOS
5. Garis Drop - Garis vertikal dan horizontal dari titik RS untuk memudahkan pembacaan
### Output dan Ekspor
- Hasil Perhitungan: Menampilkan nilai BOR (%), ALOS, TOI, dan BTO
- Data JSON: Menampilkan semua data dalam format JSON yang dapat di-copy
- Download Grafik: Tombol untuk mengunduh grafik sebagai file PNG
## 📈 Interpretasi Hasil
- Posisi Ideal Rumah Sakit di Grafik Barber Johnson
- Kuadran Optimal: TOI = 1-3 hari, ALOS = 3-12 hari
- Semakin dekat ke origin (0,0) dengan TOI rendah dan ALOS moderat = efisiensi tinggi
- Hindari: TOI terlalu tinggi (tempat tidur kosong lama) atau ALOS terlalu tinggi (pasien rawat terlalu lama)
## 🛠️ Teknologi yang Digunakan
- React 18 - Framework UI
- TypeScript - Type-safe JavaScript
- Recharts - Library untuk visualisasi grafik
- Tailwind CSS - Styling
- Vite - Build tool
- Lucide React - Icon library
## 📝 Contoh Penggunaan
### Skenario:
Rumah sakit dengan 100 tempat tidur dalam periode 30 hari:

- Pasien Keluar Hidup: 450
- Pasien Keluar Mati < 48 Jam: 5
- Pasien Keluar Mati > 48 Jam: 10
- Jumlah Hari Perawatan: 2,100
- Lama Dirawat: 2,100
- Periode: 30 hari
- Hasil Perhitungan:
- BOR = (2,100 / (100 × 30)) × 100% = 70%
- ALOS = 2,100 / (450 + 5 + 10) = 4.29 hari
- TOI = ((100 × 30) - 2,100) / (450 + 5 + 10) = 1.37 hari
- BTO = (450 + 5 + 10) / 100 = 4.65 pasien per tempat tidur
## 🐛 Troubleshooting
### Port sudah digunakan
Jika port 5173 sudah terpakai, jalankan:

```bash
npm run dev -- --port 3000
```
### Error saat install dependencies
Coba hapus node_modules dan package-lock.json, lalu install ulang:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Grafik tidak muncul
Pastikan semua 7 parameter input sudah diisi dengan nilai yang valid dan klik "GENERATE GRAFIK"

## 📞 Kontak & Dukungan
Jika menemukan bug atau memiliki saran, silakan buka Issue di repository ini

## 📄 Lisensi
Project ini bersifat open source dan dapat digunakan sesuai kebutuhan

## 🔗 Referensi
[Metode Barber Johnson](https://en.wikipedia.org/wiki/Barber_Johnson_method)

[Panduan Efisiensi Tempat Tidur Rumah Sakit](https://www.depkes.go.id/)
