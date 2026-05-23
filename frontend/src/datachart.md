# Query SQL untuk Chart di Sistem Informasi e-RTLH Kota Probolinggo

File ini berisi semua query SQL yang digunakan untuk mengambil data untuk pembuatan chart di sistem informasi e-RTLH Kota Probolinggo (admin/index.php).

## Query Pertama: Wisatawan Mancanegara (Wisman) - Pie Chart dan Bar Chart

### Query untuk Pie Chart Wisatawan Mancanegara (qWisman):
```sql
SELECT dh.tahun, n.namaNegara AS negara, SUM(dh.total) AS total
FROM data_hotel dh, hotels h, negara n
WHERE dh.idHotel = h.idHotel AND dh.negaraProvinsi = n.idNegara AND dh.tahun = '$tahun' AND dh.kategori = 'Wisman' AND dh.status = '1'
GROUP BY dh.tahun, n.namaNegara
ORDER BY dh.tahun ASC, n.namaNegara
```

### Query untuk Bar Chart Wisatawan Mancanegara (wisman1) - Admin:
```sql
SELECT SUM(CASE WHEN tahun = '$tahun' AND kategori = 'Wisman' AND status = '1' THEN total ELSE 0 END) as wisman1
FROM data_hotel GROUP BY bulan
```

### Query untuk Bar Chart Wisatawan Mancanegara (wisman1) - Hotel:
```sql
SELECT SUM(CASE WHEN tahun = '$tahun' AND kategori = 'Wisman' AND status = '1' THEN total ELSE 0 END) as wisman1
FROM data_hotel WHERE idHotel = '$login' GROUP BY bulan
```

## Query Kedua: Wisatawan Nusantara (Wisnus) - Pie Chart dan Bar Chart

### Query untuk Pie Chart Wisatawan Nusantara (qWisnus):
```sql
SELECT dh.tahun, p.namaProvinsi AS provinsi, SUM(dh.total) AS total
FROM data_hotel dh, hotels h, provinsi p
WHERE dh.idHotel = h.idHotel AND dh.negaraProvinsi = p.idProvinsi AND dh.tahun = '$tahun' AND dh.kategori = 'Wisnus' AND dh.status = '1'
GROUP BY dh.tahun, p.namaProvinsi
ORDER BY dh.tahun ASC, p.namaProvinsi
```

### Query untuk Bar Chart Wisatawan Nusantara (wisnus) - Admin:
```sql
SELECT SUM(CASE WHEN tahun = '$tahun' AND kategori = 'Wisnus' AND status = '1' THEN total ELSE 0 END) as wisnus
FROM data_hotel GROUP BY bulan
```

### Query untuk Bar Chart Wisatawan Nusantara (wisnus) - Hotel:
```sql
SELECT SUM(CASE WHEN tahun = '$tahun' AND kategori = 'Wisnus' AND status= '1' THEN total ELSE 0 END) as wisnus
FROM data_hotel WHERE idHotel = '$login' GROUP BY bulan
```

## Query Ketiga: Wisatawan Mancanegara pada Destinasi Wisata (wismanw)

### Query untuk Bar Chart Wisatawan Mancanegara di Destinasi Wisata - Admin:
```sql
SELECT SUM(CASE WHEN tahun = '$tahun' THEN wisman ELSE 0 END) as wismanw
FROM data_wisata GROUP BY bulan
```

### Query untuk Bar Chart Wisatawan Mancanegara di Destinasi Wisata - Wisata:
```sql
SELECT SUM(CASE WHEN tahun = '$tahun' THEN wisman ELSE 0 END) as wismanw
FROM data_wisata WHERE idWisata = '$login' GROUP BY bulan
```

## Query Keempat: Wisatawan Nusantara pada Destinasi Wisata (wisnusw)

### Query untuk Bar Chart Wisatawan Nusantara di Destinasi Wisata - Admin:
```sql
SELECT SUM(CASE WHEN tahun = '$tahun' THEN wisnus ELSE 0 END) as wisnusw
FROM data_wisata GROUP BY bulan
```

### Query untuk Bar Chart Wisatawan Nusantara di Destinasi Wisata - Wisata:
```sql
SELECT SUM(CASE WHEN tahun = '$tahun' THEN wisnus ELSE 0 END) as wisnusw
FROM data_wisata WHERE idWisata = '$login' GROUP BY bulan
```

## Ringkasan Tabel yang Digunakan

1. **data_hotel**: Tabel utama untuk data kunjungan wisatawan ke hotel
   - Kolom penting: tahun, kategori, idHotel, negaraProvinsi, total, status, bulan

2. **data_wisata**: Tabel untuk data kunjungan wisatawan ke destinasi wisata
   - Kolom penting: tahun, wisman, wisnus, idWisata, bulan

3. **hotels**: Tabel informasi hotel
   - Kolom penting: idHotel, nameHotel

4. **negara**: Tabel informasi negara
   - Kolom penting: idNegara, namaNegara

5. **provinsi**: Tabel informasi provinsi
   - Kolom penting: idProvinsi, namaProvinsi

6. **wisata**: Tabel informasi destinasi wisata
   - Kolom penting: idWisata, nameWisata

## Variabel Dinamis dalam Query

- `$tahun`: Tahun yang sedang dipilih/diset di sesi
- `$login`: ID hotel atau destinasi wisata berdasarkan login pengguna
- `$akses`: Hak akses pengguna (Administrator, Hotel, Wisata)

## Jenis Chart yang Dibuat

1. **wismanall**: Pie chart wisatawan mancanegara
2. **wisnusall**: Pie chart wisatawan nusantara
3. **wismanhot**: Column chart wisatawan mancanegara per bulan
4. **wisnushot**: Column chart wisatawan nusantara per bulan
5. **wismanwis**: Column chart wisatawan mancanegara di destinasi wisata
6. **wisnuswis**: Column chart wisatawan nusantara di destinasi wisata

## Format Respons API dari Backend

Untuk mengimplementasikan chart-chart di atas di frontend Vue, berikut adalah format respons API yang diharapkan dari backend Go:

### 1. Endpoint: GET /api/v1/charts/wisman-by-country
Respons untuk pie chart wisatawan mancanegara berdasarkan negara asal:
```json
{
  "success": true,
  "message": "Data wisatawan mancanegara berhasil diambil",
  "data": {
    "wismanByCountry": [
      { "country": "Indonesia", "value": 12345 },
      { "country": "Malaysia", "value": 9876 },
      { "country": "Singapura", "value": 8765 },
      { "country": "Australia", "value": 7654 }
    ],
    "year": 2024
  }
}
```

### 2. Endpoint: GET /api/v1/charts/wisman-by-month
Respons untuk bar chart wisatawan mancanegara berdasarkan bulan:
```json
{
  "success": true,
  "message": "Data wisatawan mancanegara per bulan berhasil diambil",
  "data": {
    "wismanByMonth": [
      { "month": "Januari", "value": 1000 },
      { "month": "Februari", "value": 1200 },
      { "month": "Maret", "value": 1500 },
      { "month": "April", "value": 1800 },
      { "month": "Mei", "value": 2000 },
      { "month": "Juni", "value": 2200 },
      { "month": "Juli", "value": 2500 },
      { "month": "Agustus", "value": 2800 },
      { "month": "September", "value": 3000 },
      { "month": "Oktober", "value": 2700 },
      { "month": "November", "value": 2400 },
      { "month": "Desember", "value": 2100 }
    ],
    "year": 2024
  }
}
```

### 3. Endpoint: GET /api/v1/charts/wisnus-by-province
Respons untuk pie chart wisatawan nusantara berdasarkan provinsi asal:
```json
{
  "success": true,
  "message": "Data wisatawan nusantara berdasarkan provinsi berhasil diambil",
  "data": {
    "wisnusByProvince": [
      { "province": "Jawa Timur", "value": 25000 },
      { "province": "Jawa Tengah", "value": 18000 },
      { "province": "Jawa Barat", "value": 15000 },
      { "province": "DKI Jakarta", "value": 12000 },
      { "province": "Bali", "value": 10000 }
    ],
    "year": 2024
  }
}
```

### 4. Endpoint: GET /api/v1/charts/wisnus-by-month
Respons untuk bar chart wisatawan nusantara berdasarkan bulan:
```json
{
  "success": true,
  "message": "Data wisatawan nusantara per bulan berhasil diambil",
  "data": {
    "wisnusByMonth": [
      { "month": "Januari", "value": 5000 },
      { "month": "Februari", "value": 5500 },
      { "month": "Maret", "value": 6000 },
      { "month": "April", "value": 6500 },
      { "month": "Mei", "value": 7000 },
      { "month": "Juni", "value": 7500 },
      { "month": "Juli", "value": 8000 },
      { "month": "Agustus", "value": 8500 },
      { "month": "September", "value": 9000 },
      { "month": "Oktober", "value": 8800 },
      { "month": "November", "value": 8200 },
      { "month": "Desember", "value": 7800 }
    ],
    "year": 2024
  }
}
```

### 5. Endpoint: GET /api/v1/charts/visitor-data-by-type
Respons untuk chart kunjungan wisatawan di destinasi wisata:
```json
{
  "success": true,
  "message": "Data kunjungan wisatawan di destinasi wisata berhasil diambil",
  "data": {
    "visitorDataByType": [
      { "month": "Januari", "wisman": 800, "wisnus": 4200 },
      { "month": "Februari", "wisman": 950, "wisnus": 4600 },
      { "month": "Maret", "wisman": 1200, "wisnus": 5000 },
      { "month": "April", "wisman": 1400, "wisnus": 5500 },
      { "month": "Mei", "wisman": 1600, "wisnus": 6000 },
      { "month": "Juni", "wisman": 1800, "wisnus": 6200 },
      { "month": "Juli", "wisman": 2000, "wisnus": 6800 },
      { "month": "Agustus", "wisman": 2200, "wisnus": 7200 },
      { "month": "September", "wisman": 2500, "wisnus": 7500 },
      { "month": "Oktober", "wisman": 2300, "wisnus": 7300 },
      { "month": "November", "wisman": 2100, "wisnus": 6900 },
      { "month": "Desember", "wisman": 1900, "wisnus": 6500 }
    ],
    "year": 2024
  }
}
```

### Parameter Umum untuk Semua Endpoint
- `year`: Tahun untuk filter data (opsional, default: tahun saat ini)
- `access_token`: Token otentikasi untuk akses (diperlukan untuk endpoint yang dilindungi)

### Error Response Umum
```json
{
  "success": false,
  "message": "Deskripsi kesalahan",
  "data": null
}
```