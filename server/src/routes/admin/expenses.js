const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM expenses ORDER BY expense_date DESC, id DESC').all();
    const total = rows.reduce((sum, r) => sum + r.amount, 0);
    res.render('admin/expenses/list', { pageTitle: 'Gastos', rows, total });
});

router.get('/nuevo', (req, res) => {
    res.render('admin/expenses/form', { pageTitle: 'Nuevo gasto', row: {} });
});

router.post('/nuevo', (req, res) => {
    const { category, concept, amount, currency, expense_date, notes } = req.body;
    if (!concept || !amount) return res.redirect('/admin/gastos/nuevo');
    db.prepare(`INSERT INTO expenses (category, concept, amount, currency, expense_date, notes) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(category || 'general', concept, parseFloat(amount), currency || 'PEN', expense_date || new Date().toISOString().slice(0, 10), notes || '');
    res.redirect('/admin/gastos');
});

router.get('/:id/editar', (req, res) => {
    const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!row) return res.redirect('/admin/gastos');
    res.render('admin/expenses/form', { pageTitle: 'Editar gasto', row });
});

router.post('/:id/editar', (req, res) => {
    const { category, concept, amount, currency, expense_date, notes } = req.body;
    db.prepare(`UPDATE expenses SET category=?, concept=?, amount=?, currency=?, expense_date=?, notes=? WHERE id=?`)
        .run(category || 'general', concept, parseFloat(amount), currency || 'PEN', expense_date, notes || '', req.params.id);
    res.redirect('/admin/gastos');
});

router.post('/:id/eliminar', (req, res) => {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.redirect('/admin/gastos');
});

module.exports = router;
