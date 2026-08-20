const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../../db');
const { csrfProtect } = require('../../middleware/csrf');

router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/admin');
    res.render('admin/login', { error: null, layout: false });
});

router.post('/login', csrfProtect, (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').trim().toLowerCase());
    if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
        return res.status(401).render('admin/login', { error: 'Correo o contraseña incorrectos.' });
    }
    req.session.regenerate((err) => {
        if (err) return res.status(500).render('admin/login', { error: 'No se pudo iniciar sesión, intenta de nuevo.' });
        req.session.userId = user.id;
        res.redirect('/admin');
    });
});

router.post('/logout', csrfProtect, (req, res) => {
    req.session.destroy(() => res.redirect('/admin/login'));
});

module.exports = router;
