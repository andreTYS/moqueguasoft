const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
    const projects = db.prepare(`
        SELECT projects.*, clients.name AS client_name FROM projects
        LEFT JOIN clients ON clients.id = projects.client_id
        ORDER BY projects.created_at DESC
    `).all();
    res.render('admin/projects/list', { pageTitle: 'Proyectos', projects });
});

router.get('/nuevo', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    res.render('admin/projects/form', { pageTitle: 'Nuevo proyecto', project: {}, clients });
});

router.post('/nuevo', (req, res) => {
    const { client_id, name, description, status, budget, start_date, end_date } = req.body;
    if (!name) return res.redirect('/admin/proyectos/nuevo');
    db.prepare(`INSERT INTO projects (client_id, name, description, status, budget, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(client_id || null, name, description || '', status || 'activo', parseFloat(budget) || 0, start_date || null, end_date || null);
    res.redirect('/admin/proyectos');
});

router.get('/:id/editar', (req, res) => {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.redirect('/admin/proyectos');
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    res.render('admin/projects/form', { pageTitle: 'Editar proyecto', project, clients });
});

router.post('/:id/editar', (req, res) => {
    const { client_id, name, description, status, budget, start_date, end_date } = req.body;
    db.prepare(`UPDATE projects SET client_id=?, name=?, description=?, status=?, budget=?, start_date=?, end_date=? WHERE id=?`)
        .run(client_id || null, name, description || '', status || 'activo', parseFloat(budget) || 0, start_date || null, end_date || null, req.params.id);
    res.redirect('/admin/proyectos');
});

router.post('/:id/eliminar', (req, res) => {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.redirect('/admin/proyectos');
});

module.exports = router;
