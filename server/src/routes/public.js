const express = require('express');
const router = express.Router();
const db = require('../db');
const { getPageContent } = require('../lib/content');

router.get('/', (req, res) => {
    const slides = db.prepare('SELECT * FROM hero_slides WHERE active = 1 ORDER BY sort_order').all();
    const services = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY sort_order').all();
    const projects = db.prepare('SELECT * FROM portfolio_projects WHERE active = 1 ORDER BY sort_order LIMIT 6').all();
    const team = db.prepare('SELECT * FROM team_members WHERE active = 1 ORDER BY sort_order').all();
    const testimonials = db.prepare('SELECT * FROM testimonials WHERE active = 1 ORDER BY sort_order').all();
    const posts = db.prepare('SELECT * FROM blog_posts WHERE active = 1 ORDER BY published_at DESC LIMIT 3').all();
    res.render('public/home', {
        pageTitle: 'Inicio',
        content: getPageContent('home'),
        slides, services, projects, team, testimonials, posts,
    });
});

router.get('/nosotros', (req, res) => {
    const team = db.prepare('SELECT * FROM team_members WHERE active = 1 ORDER BY sort_order').all();
    res.render('public/about', {
        pageTitle: 'Nosotros',
        content: getPageContent('about'),
        team,
    });
});

router.get('/servicios', (req, res) => {
    const services = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY sort_order').all();
    res.render('public/services', { pageTitle: 'Servicios', services });
});

router.get('/proyectos', (req, res) => {
    const projects = db.prepare('SELECT * FROM portfolio_projects WHERE active = 1 ORDER BY sort_order').all();
    res.render('public/projects', { pageTitle: 'Proyectos', projects });
});

router.get('/equipo', (req, res) => {
    const team = db.prepare('SELECT * FROM team_members WHERE active = 1 ORDER BY sort_order').all();
    res.render('public/team', { pageTitle: 'Equipo', team });
});

router.get('/testimonios', (req, res) => {
    const testimonials = db.prepare('SELECT * FROM testimonials WHERE active = 1 ORDER BY sort_order').all();
    res.render('public/testimonials', { pageTitle: 'Testimonios', testimonials });
});

router.get('/blog', (req, res) => {
    const posts = db.prepare('SELECT * FROM blog_posts WHERE active = 1 ORDER BY published_at DESC').all();
    res.render('public/blog', { pageTitle: 'Blog', posts });
});

router.get('/blog/:slug', (req, res) => {
    const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ? AND active = 1').get(req.params.slug);
    if (!post) return res.status(404).render('public/404');
    const others = db.prepare('SELECT * FROM blog_posts WHERE active = 1 AND id != ? ORDER BY published_at DESC LIMIT 3').all(post.id);
    res.render('public/blog-post', { pageTitle: post.title, post, others });
});

router.get('/contacto', (req, res) => {
    res.render('public/contact', { pageTitle: 'Contacto', content: getPageContent('contact'), sent: req.query.sent === '1' });
});

router.post('/contacto', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (name && email && message) {
        db.prepare(`
            INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)
        `).run(name.slice(0, 200), email.slice(0, 200), (phone || '').slice(0, 60), (subject || '').slice(0, 200), message.slice(0, 4000));
    }
    res.redirect('/contacto?sent=1');
});

module.exports = router;
