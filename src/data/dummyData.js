export const users = [
  {
    id: 1,
    name: 'Nadia Putri',
    email: 'admin@gmail.com',
    password: '12345678',
    role: 'admin',
    roleName: 'Admin Gudang',
    branch: 'Gudang Utama Rafiza',
    avatar: 'AG',
    description: 'Mengelola stok bahan baku, membuat pesanan pembelian, dan mengonfirmasi barang diterima.',
  },
  {
    id: 2,
    name: 'Supplier Ayam Segar',
    email: 'supplier@gmail.com',
    password: '12345678',
    role: 'supplier',
    roleName: 'Supplier',
    branch: 'PT Ayam Segar Mandiri',
    avatar: 'SP',
    description: 'Menerima pesanan bahan baku, memproses pesanan, dan menugaskan kurir.',
  },
  {
    id: 3,
    name: 'Andi Pratama',
    email: 'kurir@gmail.com',
    password: '12345678',
    role: 'courier',
    roleName: 'Kurir',
    branch: 'Kurir Mitra Supplier',
    avatar: 'KR',
    description: 'Melihat tugas pengiriman, memperbarui status perjalanan, dan menyelesaikan pengantaran.',
  },
  {
    id: 4,
    name: 'Rafiza Management',
    email: 'manager@gmail.com',
    password: '12345678',
    role: 'manager',
    roleName: 'Manajemen',
    branch: 'Head Office Rafiza',
    avatar: 'MG',
    description: 'Memantau performa stok, pesanan, supplier, kurir, dan laporan operasional.',
  },
]

export const menuCatalog = [
  { name: 'Sayap Krispy', price: '7K', category: 'Fried Chicken', bahanUtama: 'Ayam, tepung bumbu, minyak' },
  { name: 'Paha Bawah', price: '7K', category: 'Fried Chicken', bahanUtama: 'Ayam, tepung bumbu, minyak' },
  { name: 'Paha Atas', price: '9K', category: 'Fried Chicken', bahanUtama: 'Ayam, tepung bumbu, minyak' },
  { name: 'Dada Krispy', price: '9K', category: 'Fried Chicken', bahanUtama: 'Ayam, tepung bumbu, minyak' },
  { name: 'Paket Combi 1', price: '15K', category: 'Paket Combi', bahanUtama: 'Ayam, nasi, es teh' },
  { name: 'Paket Combi 2', price: '17K', category: 'Paket Combi', bahanUtama: 'Ayam, nasi, es teh' },
  { name: 'Paket Geprek 1', price: '14K', category: 'Paket Geprek', bahanUtama: 'Ayam, nasi, sambal geprek' },
  { name: 'Paket Geprek 2', price: '16K', category: 'Paket Geprek', bahanUtama: 'Ayam, nasi, sambal geprek' },
]

export const stockItems = [
  { id: 'BB-001', name: 'Ayam Potong', category: 'Protein', stock: 35, minStock: 50, unit: 'Kg', status: 'Menipis', supplier: 'PT Ayam Segar Mandiri' },
  { id: 'BB-002', name: 'Tepung Bumbu Krispy', category: 'Bumbu', stock: 120, minStock: 45, unit: 'Kg', status: 'Aman', supplier: 'UD Bumbu Crispy' },
  { id: 'BB-003', name: 'Minyak Goreng', category: 'Minyak', stock: 25, minStock: 35, unit: 'Liter', status: 'Menipis', supplier: 'CV Sumber Minyak' },
  { id: 'BB-004', name: 'Sambal Geprek', category: 'Saus', stock: 62, minStock: 25, unit: 'Pack', status: 'Aman', supplier: 'Dapur Sambal Nusantara' },
  { id: 'BB-005', name: 'Beras Premium', category: 'Karbohidrat', stock: 80, minStock: 50, unit: 'Kg', status: 'Aman', supplier: 'Toko Beras Makmur' },
]

export const suppliers = [
  { id: 'SUP-001', name: 'PT Ayam Segar Mandiri', category: 'Ayam Potong', phone: '0811-1111-1111', address: 'Jakarta Timur', status: 'Aktif', score: 96 },
  { id: 'SUP-002', name: 'UD Bumbu Crispy', category: 'Tepung Bumbu', phone: '0833-3333-3333', address: 'Bekasi', status: 'Aktif', score: 91 },
  { id: 'SUP-003', name: 'CV Sumber Minyak', category: 'Minyak Goreng', phone: '0822-2222-2222', address: 'Tangerang', status: 'Aktif', score: 88 },
]

export const couriers = [
  { id: 'KUR-001', name: 'Andi Pratama', supplier: 'PT Ayam Segar Mandiri', phone: '0812-3344-5566', vehicle: 'Motor Box', plate: 'B 1234 RFC', status: 'Dalam Pengiriman' },
  { id: 'KUR-002', name: 'Budi Santoso', supplier: 'UD Bumbu Crispy', phone: '0821-4455-6677', vehicle: 'Motor Box', plate: 'B 7788 RFC', status: 'Tersedia' },
  { id: 'KUR-003', name: 'Rian Nugroho', supplier: 'CV Sumber Minyak', phone: '0856-1122-3344', vehicle: 'Pickup', plate: 'B 9012 RFC', status: 'Tersedia' },
]

export const purchaseOrders = [
  {
    id: 'PO-RFZ-001',
    material: 'Ayam Potong',
    qty: 100,
    unit: 'Kg',
    supplier: 'PT Ayam Segar Mandiri',
    courier: 'Andi Pratama',
    status: 'Dalam Perjalanan',
    priority: 'Tinggi',
    eta: '18 menit',
    createdAt: '10 Jun 2026, 08:15',
    branch: 'Outlet Rafiza Pusat',
  },
  {
    id: 'PO-RFZ-002',
    material: 'Minyak Goreng',
    qty: 50,
    unit: 'Liter',
    supplier: 'CV Sumber Minyak',
    courier: 'Belum ditugaskan',
    status: 'Diproses Supplier',
    priority: 'Sedang',
    eta: '-',
    createdAt: '10 Jun 2026, 09:20',
    branch: 'Outlet Rafiza Pusat',
  },
  {
    id: 'PO-RFZ-003',
    material: 'Tepung Bumbu Krispy',
    qty: 80,
    unit: 'Kg',
    supplier: 'UD Bumbu Crispy',
    courier: 'Budi Santoso',
    status: 'Selesai',
    priority: 'Normal',
    eta: 'Diterima',
    createdAt: '09 Jun 2026, 15:10',
    branch: 'Outlet Rafiza Pusat',
  },
  {
    id: 'PO-RFZ-004',
    material: 'Sambal Geprek',
    qty: 40,
    unit: 'Pack',
    supplier: 'Dapur Sambal Nusantara',
    courier: 'Belum ditugaskan',
    status: 'Menunggu Konfirmasi',
    priority: 'Normal',
    eta: '-',
    createdAt: '10 Jun 2026, 10:00',
    branch: 'Outlet Rafiza Pusat',
  },
]

export const deliveryTasks = [
  {
    id: 'DLV-001',
    orderId: 'PO-RFZ-001',
    pickup: 'PT Ayam Segar Mandiri',
    destination: 'Gudang Utama Rafiza',
    material: 'Ayam Potong 100 Kg',
    status: 'Dalam Perjalanan',
    eta: '18 menit',
    distance: '5.4 km',
    progress: 62,
  },
  {
    id: 'DLV-002',
    orderId: 'PO-RFZ-003',
    pickup: 'UD Bumbu Crispy',
    destination: 'Gudang Utama Rafiza',
    material: 'Tepung Bumbu 80 Kg',
    status: 'Selesai',
    eta: 'Diterima',
    distance: '7.2 km',
    progress: 100,
  },
]

export const activityTimeline = [
  { time: '10:20', title: 'Kurir bergerak', text: 'PO-RFZ-001 dalam perjalanan menuju gudang.' },
  { time: '09:45', title: 'Supplier memproses', text: 'CV Sumber Minyak memproses PO-RFZ-002.' },
  { time: '09:20', title: 'Pesanan dibuat', text: 'Admin membuat permintaan minyak goreng 50 Liter.' },
  { time: '08:15', title: 'Stok menipis', text: 'Ayam potong berada di bawah stok minimum.' },
]

export const managementSummary = [
  { label: 'Efisiensi Pengadaan', value: '84%', note: '+12% dari minggu lalu' },
  { label: 'Ketepatan Supplier', value: '91%', note: '3 supplier aktif' },
  { label: 'Pesanan Selesai', value: '126', note: 'Bulan berjalan' },
  { label: 'Risiko Stockout', value: '2 Item', note: 'Perlu tindakan' },
]
