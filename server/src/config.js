const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    NODE_ENV,
    isProd: NODE_ENV === 'production',
    port: parseInt(process.env.PORT, 10) || 3000,
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-not-for-production',
    siteName: process.env.SITE_NAME || 'Moquegua Soft',
    dbFile: path.join(__dirname, '..', process.env.DB_FILE || 'data/moqueguasoft.db'),
    uploadsDir: path.join(__dirname, '..', 'public', 'uploads'),
};
