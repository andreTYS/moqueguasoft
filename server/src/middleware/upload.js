const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = crypto.randomBytes(12).toString('hex');
        cb(null, `${name}${ALLOWED.has(ext) ? ext : '.jpg'}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, ALLOWED.has(ext));
    },
});

module.exports = upload;
