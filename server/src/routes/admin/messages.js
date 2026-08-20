const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    res.render('admin/messages/list', { pageTitle: 'Mensajes de contacto', rows });
});

router.post('/:id/leido', (req, res) => {
    db.prepare('UPDATE contact_messages SET read = 1 WHERE id = ?').run(req.params.id);
    res.redirect('/admin/mensajes');
});

router.post('/:id/eliminar', (req, res) => {
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
    res.redirect('/admin/mensajes');
});

module.exports = router;
