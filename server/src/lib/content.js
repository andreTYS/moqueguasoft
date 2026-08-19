const db = require('../db');

function getSettings() {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    return settings;
}

function setSetting(key, value) {
    db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, value);
}

function getPageContent(page) {
    const rows = db.prepare('SELECT field, value FROM page_content WHERE page = ?').all(page);
    const content = {};
    for (const r of rows) content[r.field] = r.value;
    return content;
}

function setPageField(page, field, value) {
    db.prepare(`
        INSERT INTO page_content (page, field, value) VALUES (?, ?, ?)
        ON CONFLICT(page, field) DO UPDATE SET value = excluded.value
    `).run(page, field, value);
}

module.exports = { getSettings, setSetting, getPageContent, setPageField };
