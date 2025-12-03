require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.get('/api/vendorA', async (req, res, next) => {
    const sql = 'SELECT kd_produk, nm_brg, hrg, ket_stok FROM vendor_a ORDER BY kd_produk ASC';
    try {
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

app.get('/api/vendorA/:kd_produk', async (req, res, next) => {
    const { kd_produk } = req.params;
    const sql = 'SELECT kd_produk, nm_brg, hrg, ket_stok FROM vendor_a WHERE kd_produk = $1';
    try {
        const result = await db.query(sql, [kd_produk]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Barang tidak ditemukan' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

app.post('/api/vendorA', async (req, res, next) => {
    const { kd_produk, nm_brg, hrg, ket_stok } = req.body;
    if (!kd_produk || !nm_brg || !hrg || !ket_stok) {
        return res.status(400).json({ error: 'Data tidak lengkap (kd_produk, nm_brg, hrg, ket_stok).' });
    }

    if (ket_stok !== 'ada' && ket_stok !== 'habis') {
        return res.status(400).json({ error: 'ket_stok harus berisi "ada" atau "habis".' });
    }

    const sql = 'INSERT INTO vendor_a (kd_produk, nm_brg, hrg, ket_stok) VALUES ($1, $2, $3, $4) RETURNING *';
    try {
        const result = await db.query(sql, [kd_produk, nm_brg, hrg, ket_stok]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { 
            return res.status(409).json({ error: 'kd_produk (Kode Produk) sudah ada' });
        }
        next(err);
    }
});

app.put('/api/vendorA/:kd_produk', async (req, res, next) => {
    const { kd_produk } = req.params;
    const { nm_brg, hrg, ket_stok } = req.body;
    
    if (!nm_brg || !hrg || !ket_stok) {
        return res.status(400).json({ error: 'Data tidak lengkap.' });
    }
    
    if (ket_stok !== 'ada' && ket_stok !== 'habis') {
        return res.status(400).json({ error: 'ket_stok harus berisi "ada" atau "habis".' });
    }

    const sql = 'UPDATE vendor_a SET nm_brg = $1, hrg = $2, ket_stok = $3 WHERE kd_produk = $4 RETURNING *';
    try {
        const result = await db.query(sql, [nm_brg, hrg, ket_stok, kd_produk]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Barang tidak ditemukan' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

app.delete('/api/vendorA/:kd_produk', async (req, res, next) => {
    const { kd_produk } = req.params;
    const sql = 'DELETE FROM vendor_a WHERE kd_produk = $1 RETURNING *';
    try {
        const result = await db.query(sql, [kd_produk]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Barang tidak ditemukan' });
        }
        res.json({ message: "Data berhasil dihapus", data: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

app.get('/', (req, res) => {
    res.send('API Vendor A (Warung Klontong Legacy) is running!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server aktif di http://localhost:${PORT}`); 
    });
}

module.exports = app;