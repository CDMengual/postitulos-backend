# Fechas opcionales de cohortes

POST /api/cohortes permite omitir fechaInicio, fechaFin,
fechaInicioInscripcion y fechaFinInscripcion. Tambien admite null o string vacio;
se guardan como null, sin inventar una fecha. Las fechas no vacias deben ser validas.

En PATCH, omitir un campo conserva su valor. Enviar null o string vacio borra
la fecha, incluida fechaInicio. Las respuestas pueden devolver null en las cuatro.

El frontend debe quitar required de estos controles y mostrar "Sin definir"
cuando una fecha sea null, sin convertirla a una fecha de 1970.

La cohorte sigue creandose INACTIVA por defecto. Cambiarla a INSCRIPCION conserva
el comportamiento existente: si no hay fechas de apertura/cierre, no se aplica
ese limite temporal a las inscripciones publicas.
