# Update FE - Gudang dan Cabang Dipisah

## Role & Dashboard
- Manager: Dashboard, Akun & Mitra, Monitoring, Laporan.
- Gudang: Dashboard, Stok Gudang, Order Supplier, Permintaan Cabang, Tracking Supplier.
- Cabang: Dashboard, Stok Cabang, Request ke Gudang, Penjualan, Status Request.
- Supplier: Dashboard, Pesanan Gudang, Kurir Supplier, Monitoring Maps.
- Kurir: Dashboard, Tugas Antar, Maps.

## Alur Operasional
Supplier → Kurir → Gudang → Cabang → Penjualan.

## Perbaikan UI
- Semua aksi penting memakai custom modal, bukan confirm/alert/prompt browser.
- Manager memiliki filter pencarian, filter status, filter role, dan tab supplier/gudang/cabang/akun.
- Gudang punya filter stok dan permintaan cabang.
- Cabang punya filter stok, request, status request, dan pencatatan penjualan via modal.

## Env Frontend Vercel
```env
VITE_API_BASE_URL=https://domain-backend-vercel-kamu.vercel.app/api
```
