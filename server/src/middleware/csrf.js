const crypto = require('crypto');

// Protección CSRF sencilla basada en token de sesión (doble verificación),
// suficiente para un panel administrativo interno de un solo usuario/rol.

// Genera/expone el token. Debe ejecutarse siempre, antes que cualquier parser de body,
// porque no depende de req.body.
function csrfToken(req, res, next) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(24).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
}

// Valida el token en peticiones que mutan estado. Debe ejecutarse DESPUÉS de que
// el body ya esté parseado (incluye formularios multipart, parseados por multer
// en middlewares específicos de cada ruta con subida de archivos).
function csrfProtect(req, res, next) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const sent = req.body && req.body._csrf;
        if (!sent || sent !== req.session.csrfToken) {
            return res.status(403).render('admin/error', {
                title: 'Solicitud inválida',
                message: 'El formulario expiró o no es válido. Vuelve a intentarlo.',
            });
        }
    }
    next();
}

module.exports = { csrfToken, csrfProtect };
