# Formularios, cohortes y aulas recuperadas

## Escenario actual: ocho aulas

Actualizacion del 25/10/2026: EI-2026 y EA-2026 se trasladaron a 2023, con fechas,
codigos de aulas y snapshots ajustados. Los unicos anios de cohortes actuales
son 2023, 2024 y 2025; todas estan FINALIZADA. Se conservan los IDs y relaciones,
8 aulas, 160 cursantes, 160 inscripciones y 70 snapshots. La seccion siguiente
describe cambios anteriores al traslado de 2026 a 2023.

Actualizacion posterior: las ocho aulas estan ahora en cohortes FINALIZADA.
Las dos cohortes de 2027 se trasladaron a 2024 conservando IDs y relaciones;
las de 2026 cierran el 20/10/2026. Se conservan EA con referente01 y EI con
referente02. No hay inscripciones abiertas en este escenario.

`npm run seed:dashboard-prueba` carga 20 cursantes ficticios por aula (160 en
total), 160 inscriptos ASIGNADA vinculados por cohorte/DNI y 70 snapshots
mensuales ficticios. Los finales de aula se distribuyen entre FINALIZADO,
ADEUDA y BAJA, sin ACTIVO. La documentacion varia entre VERIFICADA, PENDIENTE
y NO_CORRESPONDE; no se inventan archivos ni enlaces a documentos personales.
Los emails usan example.test y los DNI sinteticos se calculan a partir del ID
de aula. Las observaciones identifican los datos como seed-dashboard-v1.
Los snapshots simulan evolucion, no mediciones reales; el ultimo coincide
con los estados finales y no hay fechas futuras.

El comando evita duplicados por DNI, cohorte/DNI, cursante/aula y aula/anio/mes;
no reemplaza ediciones posteriores de esos datos y verifica cantidades/estados.
Las siguientes tablas describen el escenario anterior con aulas activas y en
inscripcion, sustituido por este escenario finalizado. No volver a ejecutar
`seed:aulas-reducidas`, `seed:cohortes` ni `seed:referentes-prueba` para restaurarlo.

El escenario historico de 72 aulas fue reducido por pedido del usuario a ocho:

| Postitulo | 2025 FINALIZADA | 2026 ACTIVA | 2027 INSCRIPCION | Referente |
| --- | --- | --- | --- | --- |
| EA | 2 aulas | 1 aula | 1 aula | referente01@example.test |
| EI | 2 aulas | 1 aula | 1 aula | referente02@example.test |

Cada aula pertenece al instituto de su referente (EA ISFD N°17, EI ISFDyT N°49).
Las cohortes 2027 tienen inscripcion del 01/10/2026 al 01/03/2027, 60 cupos y
formulario propio del postitulo. Las cohortes 2025 tienen 120 cupos, y las de
2026 tienen 60. Las cohortes EyCD e IB se conservan INACTIVA, con cero aulas y
cupos. Los otros referentes de prueba se conservan, pero quedan sin aulas.

`npm run seed:aulas-reducidas` aplica este escenario en una transaccion y verifica
el resultado. Elimina exclusivamente aulas con codigos conocidos del seed;
se detiene si hay aulas ajenas, cursantes, snapshots o inscriptos. No ejecutarlo
para ajustar escenarios con datos reales. Las fechas estan fijadas para las
pruebas iniciadas en octubre de 2026.

No ejecutar nuevamente `seed:cohortes` ni `seed:referentes-prueba` si se quiere
conservar este escenario: el primero recrea las 72 aulas, y el segundo asigna
aulas segun los institutos. Los comandos de las secciones siguientes describen
la carga historica anterior, no el escenario actual.

## Carga historica anterior

Ejecutar en este orden contra la base de desarrollo configurada en `.env`:

```powershell
npm run seed:formularios
npm run seed:cohortes
```

El primer comando crea o actualiza los formularios originales EI y EA. Requiere
esos postitulos. Si el formulario ya existe, reemplaza su definicion por la del seed.
No hay formularios recuperados para EyCD e IB.

El segundo comando usa Prisma y `prisma/cohortes2025_2026.json`, recuperado del
script historico MySQL. Crea ocho cohortes y 72 aulas:

| Postitulo | Cohortes | Cupos por cohorte | Aulas por cohorte |
| --- | --- | --- | --- |
| EI | 2025 y 2026 | 480 | 8 |
| EA | 2025 y 2026 | 480 | 8 |
| EyCD | 2025 y 2026 | 960 | 16 |
| IB | 2025 y 2026 | 240 | 4 |

Conserva fechas y estados originales: 2025 FINALIZADA; 2026 ACTIVA excepto EA,
que figura INSCRIPCION pero tiene fecha de cierre 15/03/2026. Estas fechas no
permiten probar una inscripcion actual. No se abren periodos nuevos automaticamente.
Los timestamps del SQL original se interpretan en UTC-03:00 (Buenos Aires).

Los IDs de institutos de MySQL no son reutilizables. Se vinculan los institutos
actuales a cada cohorte y se asignan aulas en rotacion, ordenando por distrito y
nombre del instituto. Esta es una distribucion de prueba, no una recuperacion de
la asignacion historica exacta. Las aulas nuevas se vinculan al primer ADMIN por
ID y al primer REFERENTE del instituto si existe. No se crean usuarios.

Los formularios EI/EA quedan vinculados a sus cohortes. El script conserva las
cohortes y aulas existentes, no elimina aulas, no cambia equipos existentes ni
borra cursantes. Completa el formulario de cohortes existentes solo si no tienen
uno. El final verifica cantidades, codigos de aulas, institutos, administradores
y correspondencia de formularios. No ejecutar dos instancias simultaneamente:
la identidad de cohorte (postitulo, anio, nombre) no tiene indice unico en la base.

Los tres postitulos nuevos JA, DIS y MC no tienen cohortes recuperadas y no se les
generan cohortes o formularios sin datos adicionales.

## Referentes ficticios

`npm run seed:referentes-prueba` crea cuatro cuentas Referente Prueba 01 a 04,
con emails `referente01@example.test` a `referente04@example.test`, DNI ficticios
99000001 a 99000004 y password inicial comun `ReferentePrueba2026!`.
Los correos de prueba no reciben email. No se cargan celulares ficticios.

Selecciona cuatro institutos distintos con aulas activas, priorizando los que
tienen mas aulas y luego su ID. Vincula cada referente a su instituto y a todas
sus aulas, sin quitar otros integrantes. Esto permite probar el acceso a aulas,
que depende de la relacion de equipo y no solo del instituto del usuario.

En repeticiones conserva password e instituto de estas cuentas, completa los
vinculos de aulas y se detiene ante colisiones de email/DNI con otros usuarios.
No restablece las contrasenas cambiadas desde la aplicacion.
