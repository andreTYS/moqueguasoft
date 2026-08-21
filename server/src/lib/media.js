// Helpers para mostrar avatares/portadas modernos (iniciales + degradado)
// en vez de las fotos de stock genéricas, salvo que el admin haya subido
// una imagen real desde el CMS (esas viven en /uploads/...).

const GRADIENTS = [
    ['#ff5630', '#ff9a3d'],
    ['#6d5bd0', '#a78bfa'],
    ['#0ea5a3', '#5eead4'],
    ['#2563eb', '#60a5fa'],
    ['#ff5630', '#6d5bd0'],
    ['#d946ef', '#f472b6'],
];

function isUploaded(p) {
    return !!p && p.startsWith('/uploads/');
}

function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h;
}

function gradientFor(seed) {
    const g = GRADIENTS[hash(String(seed)) % GRADIENTS.length];
    return `linear-gradient(135deg, ${g[0]}, ${g[1]})`;
}

// Fotos de stock (Unsplash, hotlink directo) para portadas de proyectos/blog.
// No se usan para "equipo" ni "testimonios": no queremos hacer pasar caras
// de stock como personas reales de la empresa o clientes.
// Esta sesión de desarrollo no tiene salida de red hacia CDNs de imágenes,
// así que estos enlaces no se pudieron verificar cargando aquí mismo. Por
// eso cada <img> que los usa lleva un onerror que la retira si no carga,
// dejando ver el degradado + ícono que ya sirve de fondo — nunca un ícono
// de imagen rota.
const PROJECT_STOCK = {
    'desarrollo web': 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=900&q=60',
    'sistemas erp': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=60',
    'aplicación móvil': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=60',
    'e-commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=60',
    'cms a medida': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=60',
    'consultoría ti': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=60',
};
const BLOG_STOCK = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=60',
];

function stockForProject(category, index) {
    const key = String(category || '').trim().toLowerCase();
    return PROJECT_STOCK[key] || BLOG_STOCK[index % BLOG_STOCK.length];
}

function stockForBlog(index) {
    return BLOG_STOCK[index % BLOG_STOCK.length];
}

function initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
}

module.exports = { isUploaded, gradientFor, initials, stockForProject, stockForBlog, GRADIENTS };
