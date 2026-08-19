const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
    const rows = db.prepare(`
        SELECT income.*, clients.name AS client_name, projects.name AS project_name
        FROM income
        LEFT JOIN clients ON clients.id = income.client_id
        LEFT JOIN projects ON projects.id = income.project_id
        ORDER BY income.income_date DESC, income.id DESC
    `).all();
    const total = rows.reduce((sum, r) => sum + r.amount, 0);
    res.render('admin/income/list', { pageTitle: 'Ingresos', rows, total });
});

router.get('/nuevo', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    const projects = db.prepare('SELECT * FROM projects ORDER BY name').all();
    res.render('admin/income/form', { pageTitle: 'Nuevo ingreso', row: {}, clients, projects });
});

router.post('/nuevo', (req, res) => {
    const { client_id, project_id, concept, amount, currency, method, income_date, notes } = req.body;
    if (!concept || !amount) return res.redirect('/admin/ingresos/nuevo');
    db.prepare(`INSERT INTO income (client_id, project_id, concept, amount, currency, method, income_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(client_id || null, project_id || null, concept, parseFloat(amount), currency || 'PEN', method || 'transferencia', income_date || new Date().toISOString().slice(0, 10), notes || '');
    res.redirect('/admin/ingresos');
});

router.get('/:id/editar', (req, res) => {
    const row = db.prepare('SELECT * FROM income WHERE id = ?').get(req.params.id);
    if (!row) return res.redirect('/admin/ingresos');
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    const projects = db.prepare('SELECT * FROM projects ORDER BY name').all();
    res.render('admin/income/form', { pageTitle: 'Editar ingreso', row, clients, projects });
});

router.post('/:id/editar', (req, res) => {
    const { client_id, project_id, concept, amount, currency, method, income_date, notes } = req.body;
    db.prepare(`UPDATE income SET client_id=?, project_id=?, concept=?, amount=?, currency=?, method=?, income_date=?, notes=? WHERE id=?`)
        .run(client_id || null, project_id || null, concept, parseFloat(amount), currency || 'PEN', method || 'transferencia', income_date, notes || '', req.params.id);
    res.redirect('/admin/ingresos');
});

router.post('/:id/eliminar', (req, res) => {
    db.prepare('DELETE FROM income WHERE id = ?').run(req.params.id);
    res.redirect('/admin/ingresos');
});

module.exports = router;
