# 🚀 Peta Jalan Fitur Masa Depan (Future Roadmap) — MeetApp

Dokumen ini berisi kumpulan gagasan dan ide fitur premium tingkat lanjut untuk membawa **MeetApp** menjadi platform video konferensi kelas dunia yang memiliki daya saing tinggi, visual yang memukau (*WOW Factor*), dan fungsionalitas cerdas berbasis kecerdasan buatan (AI).

Anda dapat menggunakan dokumen ini sebagai panduan untuk memilih fitur mana yang akan kita garap terlebih dahulu pada sesi pemrograman berikutnya.

---

## 📋 Ringkasan Analisis Ide Fitur

| No | Nama Fitur | Dampak (Impact) | Tingkat Kesulitan | Perkiraan Waktu Kerja | Status |
|---|---|---|---|---|---|
| 1 | **🤖 AI-Powered Smart Assistant & Auto-Notulen** | 🔥 Sangat Tinggi | 🧠 Sedang-Tinggi | 2-3 Sesi | ⏳ Siap Digarap |
| 2 | **📊 Papan Tulis Kolaboratif Premium (Whiteboard)** | ⭐ Tinggi | ⚡ Sedang | 2 Sesi | ⏳ Siap Digarap |
| 3 | **🗳️ Jajak Pendapat & Tanya Jawab (Polls & Q&A)** | 📈 Tinggi | ⚙️ Sedang-Rendah | 1-2 Sesi | ⏳ Siap Digarap |
| 4 | **📁 Pusat Berbagi Berkas & Preview Dokumen Instan** | 🚀 Tinggi | ⚙️ Sedang | 1.5 Sesi | ⏳ Siap Digarap |
| 5 | **🎵 Ruang Tunggu VIP dengan Musik Latar (Lofi Wait Room)** | 🎨 Sedang-Tinggi | ⚙️ Rendah | 1 Sesi | ⏳ Siap Digarap |

---

## 📝 Detail Breakdown Fitur

### 1. 🤖 AI-Powered Smart Assistant & Auto-Notulen (Transkrip & Ringkasan Otomatis)
> [!IMPORTANT]
> **Fitur Rekomendasi Utama!** Mengubah alur kerja pencatatan rapat dari manual menjadi 100% otomatis menggunakan kecerdasan buatan.

* **Konsep Kerja**:
  - Mengintegrasikan API Speech-to-Text (seperti OpenAI Whisper atau Google Speech-to-Text) untuk merekam dan menyalin ucapan peserta secara *real-time*.
  - Di akhir rapat, transkrip rapat dikirim ke LLM (seperti Gemini 1.5 Pro atau GPT-4o) untuk menghasilkan **Notulen Rapat Otomatis** yang terdiri dari:
    - **Ringkasan Singkat** (Executive Summary).
    - **Poin-Poin Keputusan Utama** (Key Decisions).
    - **Daftar Tindakan Lanjutan** (Action Items) lengkap dengan penanggung jawabnya.
  - Hasil notulen langsung disimpan secara otomatis ke dalam database riwayat sesi rapat.
* **Mengapa ini WOW?**: Host tidak perlu lagi mengetik catatan rapat secara manual. Cukup klik satu tombol, dan dalam 3 detik laporan rapat resmi yang super rapi dan cerdas sudah terisi otomatis di database!

---

### 2. 📊 Papan Tulis Kolaboratif Premium (Interactive Real-time Whiteboard)
> [!TIP]
> Fitur visual yang sangat interaktif dan artistik, sangat cocok untuk kolaborasi kreatif dan brainstorming tim.

* **Konsep Kerja**:
  - Menyediakan kanvas gambar berbasis vektor (SVG/Canvas) yang melayang di dalam ruang rapat aktif.
  - Setiap peserta dapat menggambar coretan, garis, bentuk (persegi, lingkaran, panah), mengetik teks, dan menaruh **Sticky Notes** (catatan tempel berwarna-warni).
  - Sinkronisasi instan menggunakan protokol WebSocket / LiveKit Data Channel sehingga gerakan kursor menggambar peserta lain terlihat mengalir tanpa lag.
  - Dilengkapi fitur ekspor hasil papan tulis ke format file PNG atau PDF berkualitas tinggi.
* **Mengapa ini WOW?**: Menjadikan rapat terasa hidup, interaktif, dan sangat visual. Pengguna tidak perlu beralih ke aplikasi pihak ketiga seperti Miro atau Figma Jam saat melakukan brainstorming ide.

---

### 3. 🗳️ Jajak Pendapat & Tanya Jawab Interaktif (Premium Polls & Q&A)
> [!NOTE]
> Fitur wajib untuk meningkatkan keterlibatan peserta rapat dalam skala besar, webinar, kelas, atau presentasi korporat.

* **Konsep Kerja**:
  - **Premium Polls**: Host dapat membuat polling instan (Pilihan Ganda, Skala Kepuasan, atau Diagram Awan Kata/Word Cloud) di panel kanan. Saat diluncurkan, hasil suara peserta akan dianimasikan secara real-time dengan grafik yang indah.
  - **Interactive Q&A**: Tab khusus di mana peserta dapat mengajukan pertanyaan tertulis. Peserta lain dapat memberikan *upvote* (jempol) sehingga pertanyaan yang paling penting/menarik otomatis naik ke posisi teratas untuk dijawab oleh pembicara.
* **Mengapa ini WOW?**: Memberikan interaksi dua arah yang dinamis. Grafik hasil jajak pendapat bergerak naik-turun dengan mulus layaknya acara kuis televisi premium.

---

### 4. 📁 Pusat Berbagi Berkas & Preview Dokumen Instan (Media Sharing Center)
* **Konsep Kerja**:
  - Menyediakan area *drag-and-drop* di dalam panel obrolan (chat).
  - Peserta rapat dapat membagikan file (PDF, Gambar, Word, Excel, PPT) secara instan.
  - **Pratinjau Langsung (Inline Preview)**: Ketika ada dokumen PDF atau gambar yang dikirim, peserta rapat dapat mengklik tombol "Pratinjau" untuk membacanya di dalam jendela melayang (*popover*) premium tanpa perlu mengunduh file atau meninggalkan layar rapat!
* **Mengapa ini WOW?**: Sangat meningkatkan efisiensi kolaborasi dokumen di tengah-tengah rapat kerja.

---

### 5. 🎵 Ruang Tunggu VIP dengan Musik Latar (Lofi Wait Room)
* **Konsep Kerja**:
  - Ketika sebuah room dikunci (*locked*), peserta luar yang mencoba masuk akan dialihkan ke **Ruang Tunggu VIP** estetik berlatar gradien redup yang bergerak lambat (*animated mesh gradients*).
  - Ditampilkan teks kustom dari host (misalnya: *"Rapat akan segera dimulai, mohon tunggu sebentar..."*).
  - Memutarkan audio instrumen latar belakang yang sangat menenangkan (seperti musik Lo-Fi jazz/chill) yang volumenya dapat diatur atau dinonaktifkan oleh calon peserta.
  - Dilengkapi tombol "Ketuk Pintu" untuk mengirimkan notifikasi ketukan halus ke host di dalam ruangan.
* **Mengapa ini WOW?**: Memberikan sentuhan kenyamanan, privasi, dan profesionalitas luar biasa bagi klien penting atau tamu luar sebelum rapat dimulai.

---

## 🛠️ Langkah Memulai Selanjutnya

1. **Pilih Ide**: Tinjau tabel di atas dan tentukan ide mana yang ingin Anda jalankan terlebih dahulu.
2. **Kembangkan Rencana**: Begitu Anda memilih satu ide, kita akan membuat `implementation_plan.md` spesifik untuk fitur tersebut di sesi berikutnya untuk menyusun arsitektur database, API rute, dan komponen UI-nya.
3. **Mulai Mengode!** 🚀

---
*Dokumen ini dibuat secara otomatis untuk membantu Anda melacak rencana pengembangan MeetApp selanjutnya.*
