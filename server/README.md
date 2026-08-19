# Moquegua Soft — sitio web + mini ERP/CMS

Aplicación Node.js (Express + EJS + SQLite) que sirve:

- El sitio público de Moquegua Soft (inicio, nosotros, servicios, proyectos, equipo, testimonios, blog, contacto).
- Un panel de administración en `/admin` con:
  - **CMS**: edita datos generales, textos, carrusel, servicios, portafolio, equipo, testimonios y blog — sin tocar código.
  - **Mini ERP**: clientes, proyectos, ingresos, gastos y facturación simple (comprobantes en PDF).

Todo el contenido del sitio público vive en una base de datos SQLite (un solo archivo), editable desde el panel.

## 1. Requisitos en el VPS

- Node.js 18 o superior (`node -v`).
- Acceso SSH con permisos para instalar paquetes y configurar Nginx.
- (Opcional pero recomendado) Nginx como proxy inverso y Certbot para HTTPS.
- (Opcional) PM2 para mantener el proceso vivo: `npm install -g pm2`.

## 2. Primera instalación

```bash
# 1. Copia el proyecto al VPS (git clone o rsync) y entra a la carpeta server/
cd /var/www/moqueguasoft/server

# 2. Instala dependencias de producción
npm install --omit=dev

# 3. Crea el archivo de configuración
cp .env.example .env
nano .env
#   - Cambia SESSION_SECRET por una clave aleatoria larga:
#     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
#   - Ajusta PORT si es necesario (por defecto 3000)

# 4. Inicializa la base de datos y crea tu usuario administrador
ADMIN_NAME="Tu Nombre" ADMIN_EMAIL="tu@correo.com" ADMIN_PASSWORD="una-clave-segura" npm run setup
#   (o ejecuta "npm run setup" sin variables para hacerlo de forma interactiva)

# 5. Prueba que arranca correctamente
npm start
#   Visita http://IP_DEL_VPS:3000 y http://IP_DEL_VPS:3000/admin
#   Detén la prueba con Ctrl+C antes de continuar
```

## 3. Mantener el proceso vivo con PM2

```bash
cd /var/www/moqueguasoft/server
pm2 start src/app.js --name moqueguasoft
pm2 save
pm2 startup   # sigue las instrucciones que imprime para que arranque solo al reiniciar el VPS
```

Comandos útiles:

```bash
pm2 logs moqueguasoft      # ver logs en vivo
pm2 restart moqueguasoft   # reiniciar tras un cambio
pm2 status                 # ver estado
```

Si prefieres **systemd** en vez de PM2, crea `/etc/systemd/system/moqueguasoft.service`:

```ini
[Unit]
Description=Moquegua Soft (sitio + ERP/CMS)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/moqueguasoft/server
ExecStart=/usr/bin/node src/app.js
Restart=always
EnvironmentFile=/var/www/moqueguasoft/server/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now moqueguasoft
```

## 4. Nginx como proxy inverso (para usar el dominio moqueguasoft.com)

Crea `/etc/nginx/sites-available/moqueguasoft.com`:

```nginx
server {
    listen 80;
    server_name moqueguasoft.com www.moqueguasoft.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/moqueguasoft.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### HTTPS con Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d moqueguasoft.com -d www.moqueguasoft.com
```

Certbot edita el bloque de Nginx automáticamente para servir HTTPS y renovar el certificado solo.

## 5. Actualizar el sitio tras un cambio de código

```bash
cd /var/www/moqueguasoft
git pull origin main            # o la rama que uses en producción
cd server
npm install --omit=dev          # sólo si cambiaron las dependencias
pm2 restart moqueguasoft        # o: sudo systemctl restart moqueguasoft
```

Los cambios hechos **desde el panel de administración** (textos, imágenes, clientes, ingresos, etc.) viven en la base de datos y **no se pierden** al actualizar el código — solo respalda `server/data/*.db` antes de cambios grandes (ver siguiente sección).

## 6. Respaldo de la base de datos

Toda la información (contenido del sitio + ERP) está en un único archivo SQLite:

```bash
server/data/moqueguasoft.db
```

Respaldo simple (cron diario recomendado):

```bash
mkdir -p /var/backups/moqueguasoft
cp /var/www/moqueguasoft/server/data/moqueguasoft.db \
   /var/backups/moqueguasoft/moqueguasoft-$(date +%F).db
```

Agrega esa línea a `crontab -e` para que corra todas las noches, por ejemplo:

```
0 3 * * * cp /var/www/moqueguasoft/server/data/moqueguasoft.db /var/backups/moqueguasoft/moqueguasoft-$(date +\%F).db
```

También conviene respaldar `server/public/uploads/` (las imágenes subidas desde el CMS).

## 7. Estructura del proyecto

```
server/
  src/
    app.js              # punto de entrada (Express)
    db.js                # esquema SQLite (se crea solo al arrancar)
    seed.js               # contenido inicial del sitio (sólo si las tablas están vacías)
    lib/                   # helpers (contenido del sitio, generación de PDF)
    middleware/             # auth, CSRF, subida de archivos
    routes/
      public.js             # rutas del sitio público
      admin/                 # rutas del panel: auth, dashboard, cms, clientes, proyectos, ingresos, gastos, facturas, mensajes
    views/
      public/                 # plantillas EJS del sitio público
      admin/                   # plantillas EJS del panel administrativo
  public/                       # CSS, JS, librerías e imágenes servidas tal cual
  scripts/setup.js               # inicializa BD + crea/actualiza el usuario admin
  data/                            # base de datos SQLite (no se versiona en git)
```

## 8. Notas de seguridad

- Cambia la contraseña por defecto y usa una `SESSION_SECRET` distinta en cada entorno.
- El panel `/admin` no tiene registro público: los usuarios sólo se crean con `npm run setup`.
- Las subidas de imágenes se limitan a 5 MB y a extensiones de imagen conocidas.
- Corre la app detrás de Nginx con HTTPS en producción; evita exponer el puerto 3000 directamente a internet (ábrelo solo en `localhost` o cierra el puerto en el firewall del VPS, p. ej. `ufw deny 3000`).
