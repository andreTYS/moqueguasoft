function requireAuth(req, res, next) {
    if (req.session && req.session.userId) return next();
    return res.redirect('/admin/login');
}

function attachUser(db) {
    return (req, res, next) => {
        res.locals.currentUser = null;
        if (req.session && req.session.userId) {
            const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.session.userId);
            res.locals.currentUser = user || null;
        }
        next();
    };
}

module.exports = { requireAuth, attachUser };
