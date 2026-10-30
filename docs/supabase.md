# Retomar el proyecto con Supabase

Esta migracion inicia una base PostgreSQL vacia; no importa datos de MySQL.
Express, Prisma y la autenticacion JWT siguen siendo los responsables de la API.
Supabase se usa para PostgreSQL y Storage, sin migrar usuarios a Supabase Auth.

## Configuracion del proyecto remoto

1. Crear un proyecto Supabase para desarrollo (o usar uno existente con base vacia).
2. Como los datos se consultan exclusivamente desde Express mediante Prisma, desactivar la Data API en la configuracion de Supabase. Storage sigue usando su propia API. No exponer las tablas de usuarios y documentos mediante acceso anonimo.
3. En **Connect**, copiar la conexion **Session pooler**, puerto 5432. Es compatible con redes IPv4. Completar el password de la base y codificar como URL cualquier caracter especial del password. No confundirlo con la service role key.
4. Copiar `.env.example` a `.env` solo si no existe y completar las variables. Para este backend persistente, `DATABASE_URL` y `DIRECT_URL` pueden usar la misma conexion Session pooler con `sslmode=require`. Tambien se puede usar una conexion directa en `DIRECT_URL` si la red soporta IPv6.
5. Generar `JWT_SECRET`, por ejemplo con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
6. Para adjuntos, configurar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y un bucket **privado** llamado `inscripciones-documentos`. Las credenciales de base y la service role key permanecen exclusivamente en el backend.

## Crear tablas y ejecutar

```powershell
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run prisma:status
npm run dev
```

Probar `http://localhost:4000/`. El health check solo verifica que Express esta funcionando; no prueba la conexion a PostgreSQL. `prisma:status` comprueba la conexion y el historial.

La migracion inicial crea las tablas del schema actual, incluidas las relaciones y enums. No crea usuarios ni datos de prueba. El seed existente solo carga formularios y requiere los postitulos EI y EA previamente creados; no usarlo como inicializador de una base vacia.

## Crear usuarios y primer administrador

Ejecutar `npm run user:create` en una terminal local (`npm run admin:create` sigue disponible como alias). Solicita nombre, apellido, DNI, email, celular opcional y seleccion de rol: ADMIN, REFERENTE, FORMADOR o COORDINADOR. Para el primer administrador, elegir ADMIN. Crea el usuario sin instituto y muestra una password aleatoria una sola vez. La base guarda un hash bcrypt compatible con el login. Si el email o DNI ya existen, no modifica el usuario. Los referentes necesitan que luego se les asigne un instituto para las funciones que lo requieren.

Iniciar sesion desde el frontend o con `POST /api/auth/login`, enviando JSON con `email` y `password`. La respuesta establece una cookie HttpOnly. Conservar esa cookie para consultar `GET /api/auth/me`. No crear el usuario desde Supabase Auth ni escribir una password en texto plano en la tabla User.

## Postitulos recuperados

`npm run seed:postitulos` crea EI (Enseñanza con imágenes) y EA (Educación ambiental. Nuevas miradas y propuestas transversales para el aula), con los requisitos conservados en el repo. Si el codigo ya existe, conserva sus datos sin actualizarlos. No completa tipos, titulos otorgados, resoluciones ni cargas horarias porque no se recuperaron esos datos. EyCD e IB quedan pendientes de confirmar sus nombres.

### Completar datos academicos

`npm run seed:postitulos-detalles` crea o actualiza los postitulos de `prisma/postitulosDetalles.json` y `prisma/postitulosAdicionales.json` con los textos aportados y los hipervinculos del Excel `Resoluciones _ Dictámenes _ Programas.xlsx`, que debe estar en la raiz. Guarda las referencias documentales y sus URLs en `prisma/postitulosDocumentos.json` para conservar tambien los numeros de resolucion y dictamen. El modelo actual guarda las URLs en `resolucion`, `resolucionPuntaje` y `dictamen`. Las referencias faltantes quedan en null; no se inventan identificadores ni enlaces.

Para limitar la carga: `npm run seed:postitulos-detalles -- --codigos=EyCD,IB,JA,DIS,MC`. Los registros existentes se actualizan por codigo; los nuevos reciben el nombre exacto del Excel. Los codigos EyCD e IB conservan los usados por los scripts historicos; JA, DIS y MC se asignaron al recuperar estas ofertas. Adultos figura solo como "Adultos" en el Excel. Solo se crean titulos otorgados cuando estan explicitamente confirmados en los textos. Los requisitos conservados de EyCD e IB se usan al crear esos registros; no se sobrescriben requisitos existentes.

EI: 400 horas y titulo de especializacion confirmado. EA: 410 horas, sin tipo ni titulo otorgado confirmado. Ambos: modalidad virtual con encuentros sincronicos. No se infiere puntaje numerico ni distribucion entre horas sincronicas y virtuales. Programa se guarda separado de planEstudios; EA no tiene plan separado confirmado. Los identificadores se guardan en resolucionNumero, resolucionPuntajeNumero y dictamenNumero. Ver [contrato y renderizado de documentos](documentos-postitulos.md). Este comando sobrescribe los campos documentados con los datos de las fuentes y verifica su persistencia en la base; no debe ejecutarse para conservar ediciones posteriores de esos campos.

### Clasificacion confirmada

El usuario confirmo que las siete ofertas son ESPECIALIZACION. `npm run seed:postitulos-tipos` actualiza esa clasificacion y el nombre de JA a "Educación secundaria de jóvenes, adultos y adultos mayores" sin modificar las fichas academicas ni los documentos. Los tipos existentes conservan su titulo; cuando no habia un registro de tipo, se crea con el nombre confirmado de la oferta como titulo, sin inferir una denominacion legal distinta. Las fuentes JSON tambien guardan esta clasificacion. La fila de JA sigue buscandose como "Adultos" en el Excel, pero la ficha usa el nombre completo confirmado.

## Historial y cambios futuros

- `prisma/migrations/` contiene exclusivamente migraciones PostgreSQL.
- `prisma/legacy-migrations-mysql/` conserva el historial antiguo como referencia; Prisma no lo ejecuta.
- No aplicar las migraciones PostgreSQL a la base MySQL anterior ni reutilizar su tabla `_prisma_migrations`.
- Para cambios futuros, generar migraciones con `prisma migrate dev` contra una base de desarrollo con una shadow database independiente; aplicar las migraciones revisadas con `npm run prisma:deploy`. No configurar la base de la aplicacion como shadow database.
- `prisma:push` queda disponible para experimentos descartables; el flujo documentado usa migraciones versionadas.
- Las busquedas de cursantes e inscriptos usan `mode: insensitive` para conservar las comparaciones sin distinguir mayusculas. PostgreSQL no garantiza la misma equivalencia de acentos que las collations de MySQL.

Referencias: [Prisma con Supabase](https://supabase.com/docs/guides/database/prisma), [conexiones PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres).
