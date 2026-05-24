const API_URL = 'http://localhost:3000/api/notes';

document.addEventListener('DOMContentLoaded', fetchNotes);

async function fetchNotes() {
    try {
        const response = await fetch(API_URL);
        const notes = await response.json();
        const container = document.getElementById('notes-container');
        
        container.innerHTML = '';

        if (notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🪁</div>
                    <p>Belum ada catatan yang tersimpan.</p>
                    <small>Tulis ide pertamamu di panel sebelah kiri!</small>
                </div>
            `;
            return;
        }

        notes.forEach(note => {
            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const tanggalFormatted = new Date(note.tanggal_dibuat).toLocaleDateString('id-ID', dateOptions);

            const card = document.createElement('div');
            card.className = 'note-card';
            card.innerHTML = `
                <div class="note-card-body">
                    <h4>${escapeHTML(note.judul)}</h4>
                    <span class="note-date">📅 ${tanggalFormatted}</span>
                    <p>${escapeHTML(note.isi).replace(/\n/g, '<br>')}</p>
                </div>
                <div class="note-card-actions">
                    <button class="btn-action btn-edit" onclick="prepareEdit(${note.id}, '${escapeJS(note.judul)}', '${escapeJS(note.isi)}')">
                        Ubah
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteNote(${note.id})">
                        Hapus
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Error saat mengambil catatan:', err);
    }
}

async function saveNote() {
    const id = document.getElementById('note-id').value;
    const judul = document.getElementById('note-judul').value.trim();
    const isi = document.getElementById('note-isi').value.trim();

    if (!judul || !isi) {
        alert('Judul dan Isi catatan tidak boleh kosong, ya!');
        return;
    }

    const payload = { judul, isi };
    let method = 'POST';
    let url = API_URL;

    if (id) {
        method = 'PUT';
        url = `${API_URL}/${id}`;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            resetForm();
            fetchNotes();
        }
    } catch (err) {
        console.error('Error saat menyimpan catatan:', err);
    }
}

async function deleteNote(id) {
    if (confirm('Catatan ini bakal dihapus permanen. Kamu yakin?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) fetchNotes();
        } catch (err) {
            console.error('Error saat menghapus catatan:', err);
        }
    }
}

function prepareEdit(id, judul, isi) {
    document.getElementById('note-id').value = id;
    document.getElementById('note-judul').value = judul;
    document.getElementById('note-isi').value = isi;

    document.getElementById('form-title').innerText = 'Mode Edit Catatan';
    document.getElementById('btn-cancel').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('note-id').value = '';
    document.getElementById('note-judul').value = '';
    document.getElementById('note-isi').value = '';
    document.getElementById('form-title').innerText = 'Buat Catatan Baru';
    document.getElementById('btn-cancel').style.display = 'none';
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function escapeJS(str) {
    return str.replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}