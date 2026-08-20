const express = require('express');
const router = express.Router();
const db = require('../../db');
const upload = require('../../middleware/upload');
const { getSettings, setSetting, getPageContent, setPageField } = require('../../lib/content');
const { csrfProtect } = require('../../middleware/csrf');

function imgPath(file, fallback) {
    return file ? `/uploads/${file.filename}` : (fallback || '');
}

/* --- Datos generales del sitio --- */
router.get('/general', (req, res) => {
    res.render('admin/cms/general', { pageTitle: 'CMS · Datos generales', settings: getSettings() });
});

router.post('/general', csrfProtect, (req, res) => {
    const fields = ['site_name', 'tagline', 'address', 'phone', 'whatsapp', 'email', 'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'map_embed'];
    for (const f of fields) {
        if (typeof req.body[f] !== 'undefined') setSetting(f, req.body[f]);
    }
    res.redirect('/admin/cms/general');
});

/* --- Textos de páginas (home / about / contact) --- */
router.get('/textos', (req, res) => {
    res.render('admin/cms/textos', {
        pageTitle: 'CMS · Textos',
        home: getPageContent('home'),
        about: getPageContent('about'),
        contact: getPageContent('contact'),
    });
});

router.post('/textos', csrfProtect, (req, res) => {
    const map = {
        home_about_title: ['home', 'about_title'],
        home_about_body: ['home', 'about_body'],
        about_intro_title: ['about', 'intro_title'],
        about_intro_body: ['about', 'intro_body'],
        about_mission: ['about', 'mission'],
        contact_intro: ['contact', 'intro'],
    };
    for (const [key, [page, field]] of Object.entries(map)) {
        if (typeof req.body[key] !== 'undefined') setPageField(page, field, req.body[key]);
    }
    res.redirect('/admin/cms/textos');
});

/* --- Slides del carrusel principal --- */
router.get('/slides', (req, res) => {
    const slides = db.prepare('SELECT * FROM hero_slides ORDER BY sort_order').all();
    res.render('admin/cms/slides', { pageTitle: 'CMS · Carrusel principal', slides });
});

router.post('/slides/nuevo', upload.single('image'), csrfProtect, (req, res) => {
    const { title, subtitle, sort_order } = req.body;
    db.prepare('INSERT INTO hero_slides (title, subtitle, image, sort_order) VALUES (?, ?, ?, ?)')
        .run(title || '', subtitle || '', imgPath(req.file, '/img/carousel-1.svg'), parseInt(sort_order, 10) || 0);
    res.redirect('/admin/cms/slides');
});

router.post('/slides/:id', upload.single('image'), csrfProtect, (req, res) => {
    const current = db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(req.params.id);
    if (!current) return res.redirect('/admin/cms/slides');
    const { title, subtitle, sort_order, active } = req.body;
    db.prepare('UPDATE hero_slides SET title=?, subtitle=?, image=?, sort_order=?, active=? WHERE id=?')
        .run(title || '', subtitle || '', imgPath(req.file, current.image), parseInt(sort_order, 10) || 0, active ? 1 : 0, req.params.id);
    res.redirect('/admin/cms/slides');
});

router.post('/slides/:id/eliminar', csrfProtect, (req, res) => {
    db.prepare('DELETE FROM hero_slides WHERE id = ?').run(req.params.id);
    res.redirect('/admin/cms/slides');
});

/* --- Servicios --- */
router.get('/servicios', (req, res) => {
    const services = db.prepare('SELECT * FROM services ORDER BY sort_order').all();
    res.render('admin/cms/servicios', { pageTitle: 'CMS · Servicios', services });
});

router.post('/servicios/nuevo', csrfProtect, (req, res) => {
    const { title, description, icon, sort_order } = req.body;
    if (!title) return res.redirect('/admin/cms/servicios');
    db.prepare('INSERT INTO services (title, description, icon, sort_order) VALUES (?, ?, ?, ?)')
        .run(title, description || '', icon || 'fas fa-laptop-code', parseInt(sort_order, 10) || 0);
    res.redirect('/admin/cms/servicios');
});

router.post('/servicios/:id', csrfProtect, (req, res) => {
    const { title, description, icon, sort_order, active } = req.body;
    db.prepare('UPDATE services SET title=?, description=?, icon=?, sort_order=?, active=? WHERE id=?')
        .run(title, description || '', icon || 'fas fa-laptop-code', parseInt(sort_order, 10) || 0, active ? 1 : 0, req.params.id);
    res.redirect('/admin/cms/servicios');
});

router.post('/servicios/:id/eliminar', csrfProtect, (req, res) => {
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.redirect('/admin/cms/servicios');
});

/* --- Portafolio de proyectos --- */
router.get('/proyectos', (req, res) => {
    const projects = db.prepare('SELECT * FROM portfolio_projects ORDER BY sort_order').all();
    res.render('admin/cms/proyectos', { pageTitle: 'CMS · Proyectos', projects });
});

router.post('/proyectos/nuevo', upload.single('image'), csrfProtect, (req, res) => {
    const { title, category, description, link, sort_order } = req.body;
    if (!title) return res.redirect('/admin/cms/proyectos');
    db.prepare('INSERT INTO portfolio_projects (title, category, description, image, link, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
        .run(title, category || '', description || '', imgPath(req.file, '/img/project-1.svg'), link || '', parseInt(sort_order, 10) || 0);
    res.redirect('/admin/cms/proyectos');
});

router.post('/proyectos/:id', upload.single('image'), csrfProtect, (req, res) => {
    const current = db.prepare('SELECT * FROM portfolio_projects WHERE id = ?').get(req.params.id);
    if (!current) return res.redirect('/admin/cms/proyectos');
    const { title, category, description, link, sort_order, active } = req.body;
    db.prepare('UPDATE portfolio_projects SET title=?, category=?, description=?, image=?, link=?, sort_order=?, active=? WHERE id=?')
        .run(title, category || '', description || '', imgPath(req.file, current.image), link || '', parseInt(sort_order, 10) || 0, active ? 1 : 0, req.params.id);
    res.redirect('/admin/cms/proyectos');
});

router.post('/proyectos/:id/eliminar', csrfProtect, (req, res) => {
    db.prepare('DELETE FROM portfolio_projects WHERE id = ?').run(req.params.id);
    res.redirect('/admin/cms/proyectos');
});

/* --- Equipo --- */
router.get('/equipo', (req, res) => {
    const team = db.prepare('SELECT * FROM team_members ORDER BY sort_order').all();
    res.render('admin/cms/equipo', { pageTitle: 'CMS · Equipo', team });
});

router.post('/equipo/nuevo', upload.single('photo'), csrfProtect, (req, res) => {
    const { name, role, facebook, twitter, instagram, linkedin, sort_order } = req.body;
    if (!name) return res.redirect('/admin/cms/equipo');
    db.prepare('INSERT INTO team_members (name, role, photo, facebook, twitter, instagram, linkedin, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(name, role || '', imgPath(req.file, '/img/team-1.svg'), facebook || '', twitter || '', instagram || '', linkedin || '', parseInt(sort_order, 10) || 0);
    res.redirect('/admin/cms/equipo');
});

router.post('/equipo/:id', upload.single('photo'), csrfProtect, (req, res) => {
    const current = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
    if (!current) return res.redirect('/admin/cms/equipo');
    const { name, role, facebook, twitter, instagram, linkedin, sort_order, active } = req.body;
    db.prepare('UPDATE team_members SET name=?, role=?, photo=?, facebook=?, twitter=?, instagram=?, linkedin=?, sort_order=?, active=? WHERE id=?')
        .run(name, role || '', imgPath(req.file, current.photo), facebook || '', twitter || '', instagram || '', linkedin || '', parseInt(sort_order, 10) || 0, active ? 1 : 0, req.params.id);
    res.redirect('/admin/cms/equipo');
});

router.post('/equipo/:id/eliminar', csrfProtect, (req, res) => {
    db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
    res.redirect('/admin/cms/equipo');
});

/* --- Testimonios --- */
router.get('/testimonios', (req, res) => {
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY sort_order').all();
    res.render('admin/cms/testimonios', { pageTitle: 'CMS · Testimonios', testimonials });
});

router.post('/testimonios/nuevo', upload.single('photo'), csrfProtect, (req, res) => {
    const { name, role, message, sort_order } = req.body;
    if (!name) return res.redirect('/admin/cms/testimonios');
    db.prepare('INSERT INTO testimonials (name, role, photo, message, sort_order) VALUES (?, ?, ?, ?, ?)')
        .run(name, role || '', imgPath(req.file, '/img/testimonial-1.svg'), message || '', parseInt(sort_order, 10) || 0);
    res.redirect('/admin/cms/testimonios');
});

router.post('/testimonios/:id', upload.single('photo'), csrfProtect, (req, res) => {
    const current = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!current) return res.redirect('/admin/cms/testimonios');
    const { name, role, message, sort_order, active } = req.body;
    db.prepare('UPDATE testimonials SET name=?, role=?, photo=?, message=?, sort_order=?, active=? WHERE id=?')
        .run(name, role || '', imgPath(req.file, current.photo), message || '', parseInt(sort_order, 10) || 0, active ? 1 : 0, req.params.id);
    res.redirect('/admin/cms/testimonios');
});

router.post('/testimonios/:id/eliminar', csrfProtect, (req, res) => {
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    res.redirect('/admin/cms/testimonios');
});

/* --- Blog --- */
const DIACRITICS_RE = /[\u0300-\u036f]/g;

function slugify(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD').replace(DIACRITICS_RE, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80);
}

router.get('/blog', (req, res) => {
    const posts = db.prepare('SELECT * FROM blog_posts ORDER BY published_at DESC').all();
    res.render('admin/cms/blog-list', { pageTitle: 'CMS · Blog', posts });
});

router.get('/blog/nuevo', (req, res) => {
    res.render('admin/cms/blog-form', { pageTitle: 'CMS · Nuevo artículo', post: {} });
});

router.post('/blog/nuevo', upload.single('image'), csrfProtect, (req, res) => {
    const { title, excerpt, content, author } = req.body;
    if (!title) return res.redirect('/admin/cms/blog/nuevo');
    let slug = slugify(title) || `post-${Date.now()}`;
    const exists = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(slug);
    if (exists) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    db.prepare('INSERT INTO blog_posts (title, slug, excerpt, content, image, author) VALUES (?, ?, ?, ?, ?, ?)')
        .run(title, slug, excerpt || '', content || '', imgPath(req.file, '/img/blog-1.svg'), author || 'Moquegua Soft');
    res.redirect('/admin/cms/blog');
});

router.get('/blog/:id/editar', (req, res) => {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!post) return res.redirect('/admin/cms/blog');
    res.render('admin/cms/blog-form', { pageTitle: 'CMS · Editar artículo', post });
});

router.post('/blog/:id/editar', upload.single('image'), csrfProtect, (req, res) => {
    const current = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!current) return res.redirect('/admin/cms/blog');
    const { title, excerpt, content, author, active } = req.body;
    db.prepare('UPDATE blog_posts SET title=?, excerpt=?, content=?, image=?, author=?, active=? WHERE id=?')
        .run(title, excerpt || '', content || '', imgPath(req.file, current.image), author || 'Moquegua Soft', active ? 1 : 0, req.params.id);
    res.redirect('/admin/cms/blog');
});

router.post('/blog/:id/eliminar', csrfProtect, (req, res) => {
    db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
    res.redirect('/admin/cms/blog');
});

module.exports = router;
