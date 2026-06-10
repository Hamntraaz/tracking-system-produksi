export const roleOptions = [
  { email: 'admin@gmail.com', label: 'Admin Gudang', role: 'admin', helper: 'Mengelola stok, membuat pesanan bahan baku, dan memantau penerimaan barang.' },
  { email: 'supplier@gmail.com', label: 'Supplier', role: 'supplier', helper: 'Menerima pesanan, memproses bahan baku, dan menugaskan kurir supplier.' },
  { email: 'kurir@gmail.com', label: 'Kurir', role: 'courier', helper: 'Melihat tugas pengiriman dan memperbarui status perjalanan.' },
  { email: 'manager@gmail.com', label: 'Manajemen', role: 'manager', helper: 'Memantau dashboard, laporan, dan risiko stok operasional.' },
]

export const menuItems = [
  { name: 'Sayap Krispy', price: '7K', category: 'Fried Chicken', ingredients: 'Ayam, tepung bumbu, minyak' },
  { name: 'Paha Bawah', price: '7K', category: 'Fried Chicken', ingredients: 'Ayam, tepung bumbu, minyak' },
  { name: 'Paha Atas', price: '9K', category: 'Fried Chicken', ingredients: 'Ayam, tepung bumbu, minyak' },
  { name: 'Dada Krispy', price: '9K', category: 'Fried Chicken', ingredients: 'Ayam, tepung bumbu, minyak' },
  { name: 'Paket Combi 1', price: '15K', category: 'Paket Nasi', ingredients: 'Ayam, nasi, es teh' },
  { name: 'Paket Combi 2', price: '17K', category: 'Paket Nasi', ingredients: 'Ayam premium, nasi, es teh' },
  { name: 'Paket Geprek 1', price: '14K', category: 'Geprek', ingredients: 'Ayam, nasi, sambal geprek' },
  { name: 'Paket Geprek 2', price: '16K', category: 'Geprek', ingredients: 'Ayam premium, nasi, sambal geprek' },
  { name: 'French Fries', price: '8K', category: 'Tambahan', ingredients: 'Kentang frozen, minyak' },
  { name: 'Kulit Crispy', price: '8K', category: 'Tambahan', ingredients: 'Kulit ayam, tepung bumbu, minyak' },
]

export const partnerPackages = [
  {
    name: 'Paket Booth Basic',
    price: 'Rp7,5 Juta',
    tag: 'Starter outlet',
    items: ['1 set booth etalase', '2 meja besar', '2 baskom', '2 capit stainless', '2 saringan minyak & tepung', '1 cetakan nasi', '10 ekor ayam marinasi', '1 dus tepung fried chicken', 'Saus sambal & saus tomat', 'Paper box, dus nasi, kertas nasi'],
  },
  {
    name: 'Paket Booth Plus',
    price: 'Rp9 Juta',
    tag: 'Lebih lengkap',
    highlighted: true,
    items: ['1 set gerobak etalase', '1 meja aduk', '2 baskom besar', '2 capit', '2 saringan minyak & tepung', '10 ekor ayam marinasi', '1 dus tepung fried chicken', 'Saus sambal & saus tomat', 'Paper bag, dus nasi, kertas nasi'],
  },
]

export const contactInfo = [
  { label: 'WhatsApp', value: 'Silakan ganti nomor WhatsApp pada file LandingPage.jsx sesuai kontak resmi Rafiza.' },
  { label: 'Layanan', value: 'Kemitraan outlet, suplai bahan baku, dan sistem operasional.' },
  { label: 'Operasional', value: 'Gudang, supplier, kurir, dan manajemen terhubung dalam satu sistem.' },
]
