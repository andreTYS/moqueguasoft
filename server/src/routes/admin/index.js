const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { csrfProtect } = require('../../middleware/csrf');

router.use('/', require('./auth'));

router.use(requireAuth);

// El CMS gestiona su propia validación CSRF por ruta, porque algunas de sus
// rutas usan multer (multipart/form-data) y el body sólo existe después de eso.
router.use('/cms', require('./cms'));

router.use(csrfProtect);

router.use('/', require('./dashboard'));
router.use('/clientes', require('./clients'));
router.use('/proyectos', require('./projects'));
router.use('/ingresos', require('./income'));
router.use('/gastos', require('./expenses'));
router.use('/facturas', require('./invoices'));
router.use('/mensajes', require('./messages'));

module.exports = router;
