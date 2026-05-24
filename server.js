const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json()); 

app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database Connection Error:', err.message);
        console.error('Pastikan MySQL berjalan dan kredensial di file .env sudah benar.');
        return;
    }
    console.log('🚀 Terhubung ke database MySQL dengan sukses.');
});


app.get('/api/notes', (req, res) => {
    const query = 'SELECT * FROM notes ORDER BY tanggal_dibuat DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error GET /api/notes:', err);
            return res.status(500).json({ message: 'Gagal mengambil data catatan', error: err.message });
        }
        res.status(200).json(results);
    });
});


app.post('/api/notes', (req, res) => {
    const { judul, isi } = req.body;

    if (!judul || !isi) {
        return res.status(400).json({ message: 'Judul dan isi catatan wajib diisi.' });
    }

    const query = 'INSERT INTO notes (judul, isi) VALUES (?, ?)';
    
    db.query(query, [judul, isi], (err, result) => {
        if (err) {
            console.error('Error POST /api/notes:', err);
            return res.status(500).json({ message: 'Gagal menambahkan catatan', error: err.message });
        }
        res.status(201).json({ 
            message: 'Catatan berhasil ditambahkan!',
            id: result.insertId, 
            judul, 
            isi 
        });
    });
});

app.put('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const { judul, isi } = req.body;

    if (!judul || !isi) {
        return res.status(400).json({ message: 'Judul dan isi catatan tidak boleh kosong saat diedit.' });
    }

    const query = 'UPDATE notes SET judul = ?, isi = ? WHERE id = ?';
    
    db.query(query, [judul, isi, id], (err, result) => {
        if (err) {
            console.error('Error PUT /api/notes:', err);
            return res.status(500).json({ message: 'Gagal memperbarui catatan', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Catatan tidak ditemukan atau tidak ada perubahan.' });
        }
        res.status(200).json({ message: 'Catatan sukses diperbarui!' });
    });
});


app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM notes WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error DELETE /api/notes:', err);
            return res.status(500).json({ message: 'Gagal menghapus catatan', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Catatan gagal dihapus, data tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Catatan berhasil dihapus dari database.' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🔮 Mimi Notes App Backend runs smoothly!`);
    console.log(`🌐 Akses aplikasi lokal di: http://localhost:${PORT}`);
    console.log(`====================================================`);
});