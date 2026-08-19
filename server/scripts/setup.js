#!/usr/bin/env node
/*
 * Inicializa la base de datos, carga el contenido por defecto del sitio (CMS)
 * y crea (o actualiza) el usuario administrador.
 *
 * Uso interactivo:
 *   npm run setup
 *
 * Uso no interactivo (por ejemplo en un despliegue automatizado):
 *   ADMIN_NAME="Admin" ADMIN_EMAIL="tu@correo.com" ADMIN_PASSWORD="clave-segura" npm run setup
 */
const readline = require('readline');
const bcrypt = require('bcryptjs');
const db = require('../src/db');
const { seedAll } = require('../src/seed');

function ask(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
    });
}

async function main() {
    console.log('== Moquegua Soft: configuración inicial ==');
    seedAll();
    console.log('Contenido por defecto del sitio (CMS) verificado.');

    let name = process.env.ADMIN_NAME;
    let email = process.env.ADMIN_EMAIL;
    let password = process.env.ADMIN_PASSWORD;

    const nonInteractive = !!(email && password);
    let rl;
    if (!nonInteractive) {
        rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        console.log('(La contraseña se mostrará en pantalla mientras la escribes; ejecuta esto en una terminal privada.)');
        name = name || await ask(rl, 'Nombre del administrador: ');
        email = email || await ask(rl, 'Correo del administrador: ');
        password = password || await ask(rl, 'Contraseña (mínimo 8 caracteres): ');
    }
    name = name || 'Administrador';

    email = (email || '').trim().toLowerCase();
    if (!email || !password) {
        console.error('Correo y contraseña son obligatorios.');
        process.exitCode = 1;
        if (rl) rl.close();
        return;
    }
    if (password.length < 8) {
        console.error('La contraseña debe tener al menos 8 caracteres.');
        process.exitCode = 1;
        if (rl) rl.close();
        return;
    }

    const hash = bcrypt.hashSync(password, 12);
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        db.prepare('UPDATE users SET name = ?, password_hash = ? WHERE id = ?').run(name, hash, existing.id);
        console.log(`Usuario administrador actualizado: ${email}`);
    } else {
        db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(name, email, hash, 'admin');
        console.log(`Usuario administrador creado: ${email}`);
    }

    if (rl) rl.close();
    console.log('Listo. Ya puedes iniciar el servidor con: npm start');
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
