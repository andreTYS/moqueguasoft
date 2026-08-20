const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    res.render('admin/clients/list', { pageTitle: 'Clientes', clients });
});

router.get('/nuevo', (req, res) => {
    res.render('admin/clients/form', { pageTitle: 'Nuevo cliente', customer: {} });
});

router.post('/nuevo', (req, res) => {
    const { name, company, email, phone, address, notes } = req.body;
    if (!name) return res.redirect('/admin/clientes/nuevo');
    db.prepare('INSERT INTO clients (name, company, email, phone, address, notes) VALUES (?, ?, ?, ?, ?, ?)')
        .run(name, company || '', email || '', phone || '', address || '', notes || '');
    res.redirect('/admin/clientes');
});

router.get('/:id/editar', (req, res) => {
    const customer = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!customer) return res.redirect('/admin/clientes');
    res.render('admin/clients/form', { pageTitle: 'Editar cliente', customer });
});

router.post('/:id/editar', (req, res) => {
    const { name, company, email, phone, address, notes } = req.body;
    db.prepare('UPDATE clients SET name=?, company=?, email=?, phone=?, address=?, notes=? WHERE id=?')
        .run(name, company || '', email || '', phone || '', address || '', notes || '', req.params.id);
    res.redirect('/admin/clientes');
});

router.post('/:id/eliminar', (req, res) => {
    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    res.redirect('/admin/clientes');
});

module.exports = router;
