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

function initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
}

module.exports = { isUploaded, gradientFor, initials, GRADIENTS };
