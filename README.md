# CSE 340 Service Network — guía paso a paso

Sitio web con Node.js, Express, EJS y PostgreSQL. Reúne todo lo pedido en las semanas 1 a 4 (asignaciones, actividades de aprendizaje y actividades de equipo).

## 1. Qué hace el sitio

| Página | URL | Semana |
|---|---|---|
| Inicio | `/` | 1 |
| Organizaciones (lista) | `/organizations` | 1–2 |
| Detalle de organización | `/organization/:id` | 3 |
| Proyectos próximos (5) | `/projects` | 2–3 |
| Detalle de proyecto (con etiquetas) | `/project/:id` | 3 |
| Categorías (lista) | `/categories` | 1–2 |
| Detalle de categoría | `/category/:id` | 3 |
| Crear / editar organización | `/new-organization`, `/edit-organization/:id` | 4 |
| Crear / editar proyecto | `/new-project`, `/edit-project/:id` | 4 |
| Asignar categorías | `/assign-categories/:projectId` | 4 |
| Errores 404 y 500 | cualquier URL inexistente, `/test-error` | 3 |

## 2. Estructura de carpetas

```
cse340-service-network/
├── server.js                  Configura Express y arranca el servidor
├── package.json               Dependencias y scripts
├── .env.example               Plantilla de variables privadas (el .env real NO se sube)
├── .gitignore                 Excluye .env y node_modules
├── public/
│   ├── css/main.css           Estilos (semana 1)
│   └── images/                Logos
└── src/
    ├── setup.sql              Crea tablas y datos (semana 2)
    ├── routes.js              TODAS las rutas (semana 3)
    ├── middleware/flash.js    Mensajes flash (semana 4)
    ├── models/                Consultas SQL: db.js, organizations.js, projects.js, categories.js
    ├── controllers/           Lógica: index.js, organizations.js, projects.js, categories.js, errors.js
    └── views/                 Plantillas EJS
        ├── partials/          header.ejs, footer.ejs
        └── errors/            404.ejs, 500.ejs
```

## 3. El patrón MVC (la idea central)

Una petición recorre siempre el mismo camino:

1. **Ruta** (`routes.js`): decide qué controlador atiende la URL.
2. **Controlador** (`controllers/*.js`): lee parámetros, pide datos al modelo y elige la vista. No contiene SQL.
3. **Modelo** (`models/*.js`): ejecuta SQL con parámetros (`$1`) y devuelve datos.
4. **Vista** (`views/*.ejs`): solo presenta los datos.

Ejemplo, `/project/6`: la ruta llama a `showProjectDetailsPage`, que usa `getProjectDetails(6)` y `getCategoriesByProjectId(6)` y renderiza `project.ejs`.

## 4. Explicación por semana

### Semana 1 — Sitio inicial
- `server.js` sirve `public/` con `express.static`, así el CSS y las imágenes se ven.
- `header.ejs` inserta el título con `<%= title %>` dentro de `<title>` y contiene el menú (Home, Organizations, Projects, Categories). `footer.ejs` muestra el copyright.
- Cada página incluye los parciales con `<%- include('partials/header') %>`. `<%-` se usa solo aquí porque es HTML propio; para datos siempre `<%=`, que escapa el HTML y evita XSS.
- El CSS es responsive, con contraste AA, enlace “saltar al contenido” y foco visible.
- Estándares: `const`, camelCase, funciones flecha, `async/await`, `import/export` (por eso `"type": "module"` en `package.json`).

### Semana 2 — Base de datos
- `setup.sql` crea 4 tablas: `organization`, `project` (clave foránea a organización: relación 1 a muchos), `category` y `project_category` (tabla puente con clave primaria compuesta: relación muchos a muchos).
- Incluye 3 organizaciones, 15 proyectos (5 por organización), 4 categorías y cada proyecto con al menos una categoría.
- `db.js` usa un `Pool` de conexiones y registra las consultas si `ENABLE_SQL_LOGGING=true`.
- Pregunta del equipo: *¿qué pasa sin clave foránea?* La base aceptaría proyectos de organizaciones inexistentes y dejaría proyectos huérfanos.

### Semana 3 — Middleware, errores y MVC
- Middleware en `server.js`: registro de peticiones (solo en desarrollo) y `res.locals.NODE_ENV` para que el footer muestre “(Development mode)”.
- Orden importante: middleware → router → catch-all 404 → manejador global de errores (4 parámetros).
- Parámetros de ruta (`/project/:id`) para identificar el recurso. Los ids se validan con `/^\d+$/`; si no existe, se responde 404 en lugar de caerse con 500.
- Pregunta del equipo: *¿por qué JOIN?* Porque el nombre de la organización vive en otra tabla. *¿Por qué `$1`?* Evita inyección SQL.

### Semana 4 — Formularios
- `express.urlencoded` y `express.json` leen el cuerpo de los POST (`req.body`).
- `express-session` + `flash.js`: mensajes que sobreviven a una redirección y se consumen al mostrarse (el header los imprime).
- Validación en servidor con `express-validator` (nombre 3–150, descripción ≤ 500, email válido, con `trim`, `escape` y `normalizeEmail`) y en cliente con atributos HTML5 (`required`, `maxlength`, `type="email"`).
- Patrón Post/Redirect/Get: tras guardar se redirige para que recargar no reenvíe el formulario.
- Editar: el formulario se rellena con los datos actuales; el `UPDATE` incluye `organization_id`, así un proyecto puede cambiar de organización.
- Categorías de un proyecto: `updateCategoryAssignments` borra las asignaciones y vuelve a insertar las marcadas.

Nota para el quiz del equipo: al editar un proyecto no cambia nada en la tabla `organization`; solo cambia el valor `organization_id` en la fila del proyecto.

## 5. Cómo ejecutarlo en tu computadora

1. Instala Node.js 20.6 o superior.
2. En la carpeta del proyecto: `npm install`.
3. Copia `.env.example` a `.env` y completa:
   - `DB_URL`: la *External Database URL* de Render.
   - `SESSION_SECRET`: genera uno con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
   - Si usas PostgreSQL local sin SSL, agrega `DB_SSL=false`.
4. En pgAdmin abre Query Tool sobre tu base y ejecuta `src/setup.sql` completo (borra y recrea las tablas).
5. `npm run dev` y abre http://127.0.0.1:3000.

Pruebas sugeridas: `/projects`, `/project/6`, `/category/1`, `/category/999` (404), `/test-error` (500), crear y editar una organización y un proyecto, y probar un nombre de 1 letra para ver la validación del servidor.

## 6. Publicar en GitHub y Render

1. Crea un repositorio en GitHub y sube el proyecto (`git init`, `git add .`, `git commit`, `git push`). Verifica que `.env` NO aparezca (lo evita `.gitignore`).
2. En Render, Web Service conectado al repositorio: Build Command `npm install`, Start Command `npm start`.
3. En *Environment* agrega `DB_URL` (la *Internal Database URL*), `SESSION_SECRET`, `ENABLE_SQL_LOGGING=false` y `NODE_ENV=production`.
4. Entrega en Canvas la URL de GitHub y la de Render.

## 7. Cosas a tener en cuenta

- `/projects` muestra solo proyectos con fecha igual o posterior a hoy. Los de ejemplo van de diciembre de 2026 a marzo de 2027; después de esas fechas la lista quedará vacía y se verá un aviso.
- Las sesiones están en memoria (suficiente para el curso): se pierden al reiniciar el servidor.
- La base gratuita de Render expira al mes: vuelve a ejecutar `setup.sql` en la base nueva.
- Los logos son imágenes de ejemplo (iniciales). Puedes reemplazarlas por las reales con el mismo nombre de archivo.
- Las asignaciones piden que entiendas cada línea: lee el código con esta guía antes de entregar. La sesión de coaching (W02) y los quizzes los haces tú; el documento no puede reemplazarlos.
