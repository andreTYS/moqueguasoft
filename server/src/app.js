const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const morgan = require('morgan');

const config = require('./config');
const db = require('./db');
const { seedAll } = require('./seed');
const { attachUser } = require('./middleware/auth');
const { csrfToken } = require('./middleware/csrf');
const { getSettings } = require('./lib/content');

seedAll();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(morgan(config.isProd ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const sessionsDir = path.join(__dirname, '..', 'data', 'sessions');
fs.mkdirSync(sessionsDir, { recursive: true });

app.use(session({
    store: new FileStore({ path: sessionsDir, logFn: () => {}, retries: 1 }),
    name: 'ms.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProd,
        maxAge: 1000 * 60 * 60 * 12,
    },
}));

app.use(attachUser(db));

app.use((req, res, next) => {
    res.locals.siteName = config.siteName;
    res.locals.currentPath = req.path;
    res.locals.settings = getSettings();
    next();
});

app.use('/', require('./routes/public'));
app.use('/admin', csrfToken, require('./routes/admin'));

app.use((req, res) => {
    res.status(404).render('public/404');
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Error interno del servidor.');
});

app.listen(config.port, () => {
    console.log(`Moquegua Soft escuchando en http://localhost:${config.port} (${config.NODE_ENV})`);
});
