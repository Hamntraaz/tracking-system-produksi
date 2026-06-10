# Rafiza Operational Partner System

Frontend sistem operasional Rafiza Fried Chicken. Data dashboard diambil dari backend API melalui `VITE_API_BASE_URL`.

## Akun Awal

- Manajemen: manager@gmail.com / 12345678

Akun admin gudang, supplier, dan kurir dibuat dari menu manajemen setelah backend tersambung.

## Jalankan

```bash
npm install
npm run dev
```

## Deploy Vercel

Set environment variable di Vercel:

```env
VITE_API_BASE_URL=https://DOMAIN-BACKEND.up.railway.app/api
VITE_CLOUDINARY_CLOUD_NAME=dubjinrem
VITE_CLOUDINARY_UPLOAD_PRESET=buktiAntar
```

Build command: `npm run build`

Output directory: `dist`

File `vercel.json` sudah disiapkan untuk build Vite dan rewrite SPA.
