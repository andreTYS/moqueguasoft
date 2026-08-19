const express = require('express');
const router = express.Router();
const db = require('../../db');
const { renderInvoicePdf } = require('../../lib/pdf');
const { getSettings } = require('../../lib/content');

function nextInvoiceNumber() {
    const last = db.prepare("SELECT number FROM invoices ORDER BY id DESC LIMIT 1").get();
    let n = 1;
    if (last && /^F-(\d+)$/.test(last.number)) {
        n = parseInt(last.number.slice(2), 10) + 1;
    }
    return `F-${String(n).padStart(6, '0')}`;
}

router.get('/', (req, res) => {
    const rows = db.prepare(`
        SELECT invoices.*, clients.name AS client_name FROM invoices
        LEFT JOIN clients ON clients.id = invoices.client_id
        ORDER BY invoices.id DESC
    `).all();
    res.render('admin/invoices/list', { pageTitle: 'Facturación', rows });
});

router.get('/nueva', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    const projects = db.prepare('SELECT * FROM projects ORDER BY name').all();
    const incomeRows = db.prepare('SELECT * FROM income ORDER BY income_date DESC').all();
    res.render('admin/invoices/form', { pageTitle: 'Nuevo comprobante', clients, projects, incomeRows, prefill: req.query });
});

router.post('/nueva', (req, res) => {
    const { client_id, project_id, income_id, concept, amount, currency, issue_date, status } = req.body;
    if (!concept || !amount) return res.redirect('/admin/facturas/nueva');
    const number = nextInvoiceNumber();
    db.prepare(`INSERT INTO invoices (number, client_id, project_id, income_id, concept, amount, currency, issue_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(number, client_id || null, project_id || null, income_id || null, concept, parseFloat(amount), currency || 'PEN', issue_date || new Date().toISOString().slice(0, 10), status || 'emitida');
    res.redirect('/admin/facturas');
});

router.post('/:id/eliminar', (req, res) => {
    db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
    res.redirect('/admin/facturas');
});

router.get('/:id/pdf', (req, res) => {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    if (!invoice) return res.redirect('/admin/facturas');
    const client = invoice.client_id ? db.prepare('SELECT * FROM clients WHERE id = ?').get(invoice.client_id) : null;
    const project = invoice.project_id ? db.prepare('SELECT * FROM projects WHERE id = ?').get(invoice.project_id) : null;
    renderInvoicePdf(res, { invoice, client, project, settings: getSettings() });
});

module.exports = router;
