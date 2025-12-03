require('dotenv').config();
const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

if (!process.env.DATABASE_URL) {
console.error("ERROR: DATABASE_URL belum diatur di Environment Variables Vercel");
process.exit(1);
}

const client = new Client({
connectionString: process.env.DATABASE_URL,
ssl: { rejectUnauthorized: false }
});

client.connect()
.then(() => console.log("Terhubung ke Neon PostgreSQL"))
.catch(err => console.error("Gagal konek DB:", err.message));

app.get('/api/vendorA', async (req, res) => {
try {
    const result = await client.query('SELECT * FROM vendor_a ORDER BY id ASC');
    res.json(result.rows);
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

app.post('/api/vendorA', async (req, res) => {
const { kd_produk, nm_brg, hrg, ket_stok } = req.body;

try {
    const query = `
    INSERT INTO vendor_a (kd_produk, nm_brg, hrg, ket_stok)
    VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [kd_produk, nm_brg, hrg, ket_stok];
    const result = await client.query(query, values);

    res.status(201).json({
    message: "Data berhasil ditambahkan",
    data: result.rows[0]
    });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

app.put('/api/vendorA/:id', async (req, res) => {
const { id } = req.params;
const { kd_produk, nm_brg, hrg, ket_stok } = req.body;

try {
    const query = `
    UPDATE vendor_a
    SET kd_produk = $1, nm_brg = $2, hrg = $3, ket_stok = $4
    WHERE id = $5
      RETURNING *
    `;
    const values = [kd_produk, nm_brg, hrg, ket_stok, id];

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({
    message: "Data berhasil diupdate",
    data: result.rows[0]
    });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

app.delete('/api/vendorA/:id', async (req, res) => {
const { id } = req.params;

try {
    const query = 'DELETE FROM vendor_a WHERE id = $1 RETURNING *';
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({
    message: "Data berhasil dihapus",
    data: result.rows[0]
    });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

app.get('/', (req, res) => {
res.send("API Vendor A (Express + Neon + Vercel) is running!");
});

app.listen(PORT, () => {
console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;