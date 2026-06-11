# Catatan Fix Routing Frontend

Versi ini memperbaiki routing semua role dan semua halaman dashboard agar URL berubah sesuai halaman yang dibuka.

## Public routes
- `/`
- `/menu`
- `/mitra`
- `/kontak`
- `/login`

## Admin
- `/admin/dashboard`
- `/admin/stocks`
- `/admin/usage`
- `/admin/orders`
- `/admin/tracking`

## Supplier
- `/supplier/dashboard`
- `/supplier/orders`
- `/supplier/couriers`
- `/supplier/monitoring`

## Kurir
- `/courier/dashboard`
- `/courier/tasks`
- `/courier/tracking`

## Manager
- `/manager/dashboard`
- `/manager/accounts`
- `/manager/monitoring`
- `/manager/reports`

## Cara deploy
1. Replace isi repo frontend dengan isi ZIP ini.
2. Pastikan Environment Variable Vercel frontend:
   `VITE_API_BASE_URL=https://URL-BACKEND-KAMU.vercel.app/api`
3. Push ke GitHub.
4. Redeploy di Vercel.

Build sudah dites dengan `npm run build` dan berhasil.
