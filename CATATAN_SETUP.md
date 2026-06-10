# Catatan Setup Frontend Rafiza

Frontend ini masih menggunakan data dummy dan belum tersambung backend.

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka URL yang muncul, biasanya:

```text
http://localhost:5173
```

## Akun dummy

| Role | Email | Password |
|---|---|---|
| Admin Gudang | admin@gmail.com | 12345678 |
| Supplier | supplier@gmail.com | 12345678 |
| Kurir | kurir@gmail.com | 12345678 |
| Manajemen | manager@gmail.com | 12345678 |

## Struktur folder

```text
src/
├── assets/              # logo dan gambar menu Rafiza
├── components/          # layout, modal, animated svg icons
├── data/                # dummy data akun, stok, pesanan, supplier, kurir
├── pages/               # halaman login/home dan dashboard
├── App.jsx              # pengatur login dan dashboard
├── main.jsx             # entry point React
└── styles.css           # styling utama
```

## Catatan fitur

- Home dibuat untuk mengajak mitra, bukan untuk order online.
- Dashboard baru satu model role/view, tetapi login sudah tersedia untuk 4 akun dummy.
- Warna dan nuansa mengikuti brand Rafiza: merah, kuning, orange, cream, happy/enerjik.
- Modal dan icon SVG sudah diberi animasi CSS.
- Tracking maps masih berupa dummy visual. Nanti bisa diganti Leaflet/OpenStreetMap atau Google Maps saat masuk tahap tracking sebenarnya.
