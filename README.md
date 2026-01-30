# Kas Kontrakan Sigma 💵

Aplikasi pencatatan kas untuk kontrakan dengan 8 penghuni. Built with Next.js + Supabase.

## Features

- 📊 **Dashboard** - Lihat saldo kas, pemasukan, pengeluaran
- 💰 **Pemasukan** - Catat uang masuk dari penghuni
- 💸 **Pengeluaran** - Catat uang keluar dengan upload bukti foto
- 📅 **Iuran Bulanan** - Tracking pembayaran iuran per bulan
- 👥 **Penghuni** - Kelola data penghuni (AC/Non-AC, lantai atas/bawah)
- 🏷️ **Kategori** - Kelola kategori transaksi (listrik, air, keamanan, dll)

## Setup

### 1. Supabase Setup

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka SQL Editor dan jalankan `supabase-schema.sql`
3. Buat Storage bucket:
   - Buka Storage > Create new bucket
   - Name: `receipts`
   - Public: ✅ Yes

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` dengan credentials dari Supabase dashboard (Settings > API):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Run Development Server

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push ke GitHub
2. Connect repo ke [vercel.com](https://vercel.com)
3. Tambah environment variables di Vercel dashboard
4. Deploy! 🚀

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Database + Storage
- **Vercel** - Hosting

## Penghuni Default

| Nama | Iuran/bulan | Kamar | Lantai |
|------|-------------|-------|--------|
| Kemas | Rp 200.000 | AC | Atas |
| Dapa | Rp 200.000 | AC | Bawah |
| Irvan | Rp 100.000 | Non-AC | Atas |
| Aji | Rp 100.000 | Non-AC | Atas |
| Jim | Rp 100.000 | Non-AC | Atas |
| Ferdy | Rp 100.000 | Non-AC | Atas |
| Randa | Rp 100.000 | Non-AC | Bawah |
| Virdio | Rp 100.000 | Non-AC | Bawah |

---

Made with ❤️ for Kontrakan Sigma
