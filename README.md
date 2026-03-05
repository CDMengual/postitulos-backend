# Postitulos Backend

API REST para la gestion de postitulos, cohortes, aulas, cursantes, formularios e inscripciones.

## Tabla de contenidos

1. [Descripcion](#descripcion)
2. [Stack tecnologico](#stack-tecnologico)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Requisitos](#requisitos)
5. [Configuracion inicial](#configuracion-inicial)
6. [Variables de entorno](#variables-de-entorno)
7. [Base de datos y Prisma](#base-de-datos-y-prisma)
8. [Ejecucion](#ejecucion)
9. [Autenticacion y CORS](#autenticacion-y-cors)
10. [Formato de respuestas](#formato-de-respuestas)
11. [Endpoints](#endpoints)
12. [Seeds y scripts auxiliares](#seeds-y-scripts-auxiliares)
13. [Troubleshooting](#troubleshooting)

## Descripcion

Este proyecto expone una API en Express + TypeScript con Prisma ORM sobre MySQL.  
Incluye autenticacion por JWT almacenado en cookie `HttpOnly` y un modulo publico para consulta de cohortes en inscripcion.

## Stack tecnologico

- Node.js
- TypeScript
- Express
- Prisma ORM
- MySQL
- JWT (`jsonwebtoken`)
- `bcrypt` para hash de contrasenas
- `multer` para importacion de archivos en memoria

## Estructura del proyecto

```text
.
|-- prisma/
|   |-- schema.prisma
|   |-- migrations/
|   |-- seed.ts
|   |-- distritosSeed.ts
|   |-- institutosSeed.ts
|   `-- formularioEIseed.ts
|-- scripts/
|   |-- migratePostituloTipos.ts
|   `-- updateFormularioEI.ts
|-- src/
|   |-- controllers/
|   |-- middlewares/
|   |-- routes/
|   |-- services/
|   |-- prisma/client.ts
|   |-- utils/
|   `-- index.ts
|-- package.json
`-- tsconfig.json
```

## Requisitos

- Node.js 18 o superior
- MySQL 8+ (local o remoto)
- npm

## Configuracion inicial

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo `.env` en la raiz del proyecto.
3. Configurar base de datos MySQL (por ejemplo con MySQL Workbench).

## Variables de entorno

Crear `.env` con:

```env
DATABASE_URL="mysql://USUARIO:CLAVE@localhost:3306/postitulos_db"
JWT_SECRET="SECRETO_LARGO_Y_ALEATORIO"
PORT=4000
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
SUPABASE_BUCKET="inscripciones-documentos"
PUBLIC_UPLOAD_MAX_BYTES=8388608
```

Notas:

- `DATABASE_URL` es obligatoria para Prisma.
- `JWT_SECRET` es obligatoria para login/verificacion de token.
- `CLIENT_URL` se usa en CORS para permitir credenciales desde el frontend.
- `SUPABASE_BUCKET` debe ser un bucket privado para DNI/Titulo.
- `PUBLIC_UPLOAD_MAX_BYTES` es opcional; por defecto 8 MB.

## Base de datos y Prisma

Comandos recomendados:

```bash
npm run prisma:generate
npm run prisma:push
```

Opcional para inspeccion de datos:

```bash
npm run prisma:studio
```

Si queres ejecutar seeds:

```bash
npx prisma db seed
```

## Ejecucion

Desarrollo (hot reload con nodemon + ts-node):

```bash
npm run dev
```

Build de produccion:

```bash
npm run build
npm start
```

Health check:

```http
GET /
```

Respuesta esperada: API operativa.

## Autenticacion y CORS

- Login en `POST /api/auth/login`.
- El backend devuelve cookie `auth_token` (`HttpOnly`, `sameSite: lax`, duracion 7 dias).
- Las rutas privadas usan middleware `authMiddleware`.

Para frontend web, incluir credenciales:

```ts
fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
})
```

## Formato de respuestas

Respuesta exitosa:

```json
{
  "success": true,
  "message": "Mensaje",
  "data": {},
  "meta": {}
}
```

Respuesta de error:

```json
{
  "success": false,
  "message": "Mensaje de error",
  "error": {
    "code": 400,
    "details": null
  }
}
```

## Endpoints

Base URL local: `http://localhost:4000`

### Publicos (`/api/public`)

- `GET /api/public/cohortes-en-inscripcion`
- `GET /api/public/cohortes/:id`
- `POST /api/public/cohortes/:id/uploads/sign`
- `POST /api/public/cohortes/:id/inscripciones`

### Auth (`/api/auth`)

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (requiere cookie valida)
- `PATCH /api/auth/change-password` (requiere cookie valida)

### Users (`/api/users`) - protegidos

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### Institutos (`/api/institutos`) - protegidos

- `GET /api/institutos`
- `GET /api/institutos/:id`
- `POST /api/institutos`
- `PATCH /api/institutos/:id`
- `DELETE /api/institutos/:id`

### Distritos (`/api/distritos`) - protegidos

- `GET /api/distritos`

### Postitulos (`/api/postitulos`) - protegidos

- `GET /api/postitulos`
- `GET /api/postitulos/:id`
- `POST /api/postitulos`
- `PATCH /api/postitulos/:id`
- `DELETE /api/postitulos/:id`

### Aulas (`/api/aulas`) - protegidos

- `GET /api/aulas`
- `GET /api/aulas/:id`
- `POST /api/aulas`
- `POST /api/aulas/massive`
- `PATCH /api/aulas/:id`
- `DELETE /api/aulas/:id`

Subrutas de cursantes en aula:

- `POST /api/aulas/:aulaId/cursantes`
- `POST /api/aulas/:aulaId/cursantes/import` (multipart, campo `file`)
- `DELETE /api/aulas/:aulaId/cursantes/:cursanteId`
- `PATCH /api/aulas/:aulaId/cursantes/:cursanteId/estado`
- `PATCH /api/aulas/:aulaId/cursantes/:cursanteId/documentacion`

### Cursantes (`/api/cursantes`) - protegidos

- `GET /api/cursantes`
- `GET /api/cursantes/:id`
- `PATCH /api/cursantes/:id`
- `DELETE /api/cursantes/:id`

### Cohortes (`/api/cohortes`) - protegidos

- `GET /api/cohortes`
- `GET /api/cohortes/:id`
- `POST /api/cohortes`
- `PATCH /api/cohortes/:id`
- `DELETE /api/cohortes/:id`
- `PATCH /api/cohortes/:id/estado`

### Formularios (`/api/formularios`) - protegidos

- `GET /api/formularios`
- `GET /api/formularios/:id`

Filtro disponible:

- `GET /api/formularios?postituloId=<id>`

## Que data devuelve cada endpoint

Todos los endpoints usan la envoltura:

- `success`: boolean
- `message`: string
- `data`: payload principal
- `meta`: opcional (ej. totales)

Resumen por modulo (campo `data`):

### Publicos

- `GET /api/public/cohortes-en-inscripcion`: lista de cohortes en estado `INSCRIPCION` con `id`, `nombre`, `anio`, fechas de inscripcion, `postitulo` basico y `formulario` (incluye `campos`).
- `GET /api/public/cohortes/:id`: una cohorte publica con `postitulo` ampliado (`planEstudios`, `resolucion`, `tipos`) y `formulario`.
- `POST /api/public/cohortes/:id/uploads/sign`: genera URL firmada de subida para bucket privado (`tipo`: `dni` o `titulo`).
- `POST /api/public/cohortes/:id/inscripciones`: crea inscripcion publica. Para adjuntos enviar `dniAdjuntoPath` y/o `tituloAdjuntoPath` (ruta interna de Supabase Storage, no URL publica).

### Auth

- `POST /api/auth/login`: `{ user }` (sin password). Ademas setea cookie `auth_token`.
- `POST /api/auth/logout`: `data: null` (limpia cookie).
- `GET /api/auth/me`: usuario autenticado con su `instituto`, `distrito` y `region`.
- `PATCH /api/auth/change-password`: `data: null`. Valida contrasena actual y actualiza password hasheada.

Body esperado para cambio de contrasena:

```json
{
  "currentPassword": "actual123",
  "newPassword": "nueva12345"
}
```

### Users

- `GET /api/users`: lista de usuarios sin password, con `instituto -> distrito -> region`; incluye `meta.total`.
- `GET /api/users/:id`: un usuario sin password, con relaciones de instituto/distrito/region.
- `POST /api/users`: usuario creado sin password en la respuesta.
- `PATCH /api/users/:id`: usuario actualizado.
- `DELETE /api/users/:id`: `data: null`.

### Institutos

- `GET /api/institutos`: lista simplificada (`id`, `nombre`, `distritoNombre`, `regionId`), con `meta.total`.
- `GET /api/institutos/:id`: detalle (`id`, `nombre`, `distritoId`, `distritoNombre`, `regionId`, `regionNombre`).
- `POST /api/institutos`: instituto creado.
- `PATCH /api/institutos/:id`: instituto actualizado.
- `DELETE /api/institutos/:id`: `data: null`.

### Distritos

- `GET /api/distritos`: lista (`id`, `nombre`, `regionId`), con `meta.total`.

### Postitulos

- `GET /api/postitulos`: lista con campos academicos y `tipos`; incluye `meta.total`.
- `GET /api/postitulos/:id`: detalle de postitulo con `tipos`.
- `POST /api/postitulos`: postitulo creado con `tipos`.
- `PATCH /api/postitulos/:id`: postitulo actualizado con `tipos`.
- `DELETE /api/postitulos/:id`: `data: null`.

### Aulas

- `GET /api/aulas`: lista de aulas segun rol de usuario; incluye `cohorte`, `postitulo` y `referentes`, con `meta.total`.
- `GET /api/aulas/:id`: detalle de aula con `cohorte`, `instituto`, equipos (`admins/referentes/formadores`) y `cursantes` mapeados con `estado` y `documentacion`.
- `POST /api/aulas`: aula creada.
- `POST /api/aulas/massive`: lista de aulas creadas masivamente.
- `PATCH /api/aulas/:id`: aula actualizada.
- `DELETE /api/aulas/:id`: `data: null`.
- `POST /api/aulas/:aulaId/cursantes`: cursante agregado/inscripto.
- `POST /api/aulas/:aulaId/cursantes/import`: `{ importados, duplicados }`.
- `DELETE /api/aulas/:aulaId/cursantes/:cursanteId`: desvinculacion de cursante.
- `PATCH /api/aulas/:aulaId/cursantes/:cursanteId/estado`: registro `CursanteAula` actualizado.
- `PATCH /api/aulas/:aulaId/cursantes/:cursanteId/documentacion`: registro `CursanteAula` actualizado.

### Cursantes

- `GET /api/cursantes`: resultado paginado `{ cursantes, total, page, limit, totalPages }`.
- `GET /api/cursantes/:id`: cursante con `inscripciones` y datos de aula/cohorte/postitulo.
- `PATCH /api/cursantes/:id`: cursante actualizado.
- `DELETE /api/cursantes/:id`: `data: null`.

### Cohortes

- `GET /api/cohortes`: lista con `postitulo`, `formulario`, `aulas` y `_count` (`inscriptos`, `aulas`), con `meta.total`.
- `GET /api/cohortes/:id`: detalle con `postitulo`, `formulario`, `aulas`, `inscriptos`.
- `POST /api/cohortes`: cohorte creada con relaciones.
- `PATCH /api/cohortes/:id`: cohorte actualizada con relaciones.
- `DELETE /api/cohortes/:id`: `data: null`.
- `PATCH /api/cohortes/:id/estado`: `{ id, nombre, estado }`.

### Formularios

- `GET /api/formularios`: lista con `postitulo` y `cohortes` asociadas (`id`, `nombre`, `estado`, fechas de inscripcion, `cupos`), con `meta.total`.
- `GET /api/formularios/:id`: detalle de formulario con mismas relaciones.

## Seeds y scripts auxiliares

En carpeta `prisma/`:

- `seed.ts`: crea formulario base de EI (requiere postitulo con `codigo: "EI"`).
- `distritosSeed.ts`: carga regiones y distritos.
- `institutosSeed.ts`: carga institutos de ejemplo.
- `formularioEIseed.ts`: similar a `seed.ts` para formulario EI.

En carpeta `scripts/`:

- `updateFormularioEI.ts`: ajusta campos del formulario EI.
- `migratePostituloTipos.ts`: script de migracion historica/manual.

Recomendacion: ejecutar scripts manuales solo en entornos de desarrollo o despues de validar su compatibilidad con el schema actual.

## Troubleshooting

- `404` en auth/login: usar `POST /api/auth/login` (con prefijo `/api`).
- `401 No autorizado`: falta cookie `auth_token` o token expirado.
- Cookie no viaja desde frontend: usar `credentials: 'include'` y `CLIENT_URL` correcto.
- Error de conexion a DB: revisar `DATABASE_URL`, puerto, usuario y permisos MySQL.
- Error Prisma por schema: ejecutar `npm run prisma:generate` y luego `npm run prisma:push`.
