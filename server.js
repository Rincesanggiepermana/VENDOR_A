require('dotenv').config();
const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Pastikan DATABASE_URL ada
if (!process.env.DATABASE_URL) {
console.error(" ERROR: DATABASE_URL belum diatur di .env");
process.exit(1);
}

const client = new Client({
connectionString: process.env.DATABASE_URL,
ssl: { rejectUnauthorized: false }
});

// Koneksi ke database
client.connect().then(() => {
console.log("✅ Terhubung ke Neon PostgreSQL");
}).catch(err => {
console.error("❌ Gagal konek DB:", err.message);
});

app.get('/api/vendorA', async (req, res) => {
try {
    const result = await client.query('SELECT * FROM vendor_a ORDER BY id ASC');
    
    res.json({
    status: "success",
    vendor: "Vendor A - Warung Klontong",
    count: result.rows.length,
    data: result.rows
    });

} catch (error) {
    console.error("❌ Error query:", error.message);
    res.status(500).json({
    status: "error",
    message: "Gagal mengambil data vendor_a",
    error: error.message
    });
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}/api/vendorA`);
});
