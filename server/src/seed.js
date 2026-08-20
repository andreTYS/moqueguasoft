const db = require('./db');

function count(table) {
    return db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
}

function seedSettings() {
    const defaults = {
        site_name: 'Moquegua Soft',
        tagline: 'Ayudamos a hacer crecer tu negocio con tecnología',
        address: 'San Antonio, Moquegua - Perú',
        phone: '+51 953 000 000',
        whatsapp: '51953000000',
        email: 'contacto@moqueguasoft.com',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        tiktok: '',
        map_embed: 'https://www.google.com/maps?q=Moquegua,Peru&output=embed',
    };
    const existing = new Set(db.prepare('SELECT key FROM settings').all().map(r => r.key));
    const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(defaults)) {
        if (!existing.has(key)) insert.run(key, value);
    }
}

function seedPageContent() {
    if (count('page_content') > 0) return;
    const rows = [
        ['home', 'about_title', 'Sobre Moquegua Soft'],
        ['home', 'about_body', 'Somos una empresa de tecnología con sede en Moquegua, dedicada a construir sitios web, sistemas de gestión (ERP) y plataformas a medida para negocios que quieren organizar sus ingresos, clientes y proyectos en un solo lugar.'],
        ['about', 'intro_title', 'Sobre nosotros'],
        ['about', 'intro_body', 'Moquegua Soft nació para acompañar a pequeñas y medianas empresas de la región en su transformación digital: páginas web, sistemas internos y herramientas de gestión hechas a la medida de cada negocio.'],
        ['about', 'mission', 'Nuestra misión es simplificar la gestión de negocios locales con software claro, confiable y adaptado a su realidad.'],
        ['contact', 'intro', 'Escríbenos y cuéntanos sobre tu proyecto. Te responderemos a la brevedad.'],
    ];
    const insert = db.prepare('INSERT INTO page_content (page, field, value) VALUES (?, ?, ?)');
    for (const [page, field, value] of rows) insert.run(page, field, value);
}

function seedHeroSlides() {
    if (count('hero_slides') > 0) return;
    const insert = db.prepare('INSERT INTO hero_slides (title, subtitle, image, sort_order) VALUES (?, ?, ?, ?)');
    insert.run('Software a la medida de tu negocio', 'Desarrollo web, ERP y CMS para empresas de Moquegua y todo el Perú', '/img/carousel-1.svg', 1);
    insert.run('Gestiona tus ingresos y tu plataforma en un solo lugar', 'Mini ERP con panel de administración, clientes, proyectos y facturación simple', '/img/carousel-2.svg', 2);
}

function seedServices() {
    if (count('services') > 0) return;
    const items = [
        ['Sistemas ERP', 'Control de ingresos, gastos, clientes y proyectos en un panel centralizado, hecho a la medida de tu negocio.', 'fas fa-chart-line'],
        ['Desarrollo Web', 'Sitios y landing pages rápidas, responsivas y optimizadas para buscadores.', 'fas fa-laptop-code'],
        ['CMS y Gestión de Contenido', 'Edita textos e imágenes de tu web sin tocar código, desde un panel simple.', 'fas fa-edit'],
        ['Software a Medida', 'Sistemas hechos a tu proceso: desde un formulario hasta una plataforma completa.', 'fas fa-code'],
        ['Seguridad Informática', 'Buenas prácticas, copias de seguridad y protección de tus datos y accesos.', 'fas fa-shield-alt'],
        ['Consultoría TI', 'Te ayudamos a elegir e implementar la tecnología correcta para tu negocio.', 'fas fa-users-cog'],
    ];
    const insert = db.prepare('INSERT INTO services (title, description, icon, sort_order) VALUES (?, ?, ?, ?)');
    items.forEach((it, i) => insert.run(it[0], it[1], it[2], i + 1));
}

function seedProjects() {
    if (count('portfolio_projects') > 0) return;
    const items = [
        ['Plataforma Web Corporativa', 'Desarrollo Web', '/img/project-1.svg'],
        ['ERP para Distribuidora Local', 'Sistemas ERP', '/img/project-2.svg'],
        ['App de Pedidos', 'Aplicación Móvil', '/img/project-3.svg'],
        ['Tienda en Línea', 'E-commerce', '/img/project-4.svg'],
        ['CMS para Institución Educativa', 'CMS a Medida', '/img/project-5.svg'],
        ['Migración de Infraestructura', 'Consultoría TI', '/img/project-6.svg'],
    ];
    const insert = db.prepare('INSERT INTO portfolio_projects (title, category, image, sort_order) VALUES (?, ?, ?, ?)');
    items.forEach((it, i) => insert.run(it[0], it[1], it[2], i + 1));
}

function seedTeam() {
    if (count('team_members') > 0) return;
    const items = [
        ['Por definir', 'Fundador / Desarrollo', '/img/team-1.svg'],
        ['Por definir', 'Diseño UI/UX', '/img/team-2.svg'],
        ['Por definir', 'Desarrollo Backend', '/img/team-3.svg'],
        ['Por definir', 'Soporte y Redes', '/img/team-4.svg'],
    ];
    const insert = db.prepare('INSERT INTO team_members (name, role, photo, sort_order) VALUES (?, ?, ?, ?)');
    items.forEach((it, i) => insert.run(it[0], it[1], it[2], i + 1));
}

function seedTestimonials() {
    if (count('testimonials') > 0) return;
    const items = [
        ['Cliente satisfecho', 'Comercio local', '/img/testimonial-1.svg', 'El equipo entendió justo lo que necesitábamos y ahora llevamos el control de ventas mucho más ordenado.'],
        ['Cliente satisfecho', 'Servicios profesionales', '/img/testimonial-2.svg', 'La página quedó rápida y fácil de actualizar nosotros mismos gracias al panel de administración.'],
        ['Cliente satisfecho', 'Emprendimiento', '/img/testimonial-3.svg', 'Buen soporte y comunicación clara durante todo el proyecto.'],
        ['Cliente satisfecho', 'Pyme regional', '/img/testimonial-4.svg', 'El sistema de ingresos y gastos nos ahorra horas de trabajo cada semana.'],
    ];
    const insert = db.prepare('INSERT INTO testimonials (name, role, photo, message, sort_order) VALUES (?, ?, ?, ?, ?)');
    items.forEach((it, i) => insert.run(it[0], it[1], it[2], it[3], i + 1));
}

function seedBlog() {
    if (count('blog_posts') > 0) return;
    const items = [
        ['Cómo un ERP simple ordena las finanzas de tu negocio', 'erp-simple-finanzas', 'Un ERP no tiene que ser complejo para ser útil: te contamos cómo empezar a ordenar ingresos y gastos.'],
        ['5 señales de que tu página web necesita una actualización', 'senales-actualizar-pagina-web', 'Velocidad, diseño responsivo y contenido actualizado: claves para no perder clientes.'],
        ['Qué es un CMS y por qué te conviene tener uno', 'que-es-un-cms', 'Edita tu propio contenido sin depender de un desarrollador para cada cambio.'],
    ];
    const insert = db.prepare('INSERT INTO blog_posts (title, slug, excerpt, content, image, author) VALUES (?, ?, ?, ?, ?, ?)');
    items.forEach((it, i) => insert.run(
        it[0], it[1], it[2],
        `<p>${it[2]}</p><p>Contenido de ejemplo generado automáticamente. Edítalo desde el panel de administración (CMS) para publicar tu propio artículo.</p>`,
        `/img/blog-${i + 1}.svg`, 'Moquegua Soft'
    ));
}

function seedAll() {
    seedSettings();
    seedPageContent();
    seedHeroSlides();
    seedServices();
    seedProjects();
    seedTeam();
    seedTestimonials();
    seedBlog();
}

module.exports = { seedAll };
