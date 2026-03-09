"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicService = void 0;
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../prisma/client"));
const MAX_SERIALIZATION_RETRIES = 5;
const getCapacidad = (value) => Math.max(value ?? 0, 0);
const calcularDisponibilidad = ({ cupos, cuposListaEspera, inscriptosTotales, }) => {
    const capacidadRegular = getCapacidad(cupos);
    const capacidadEspera = getCapacidad(cuposListaEspera);
    const cuposTotales = capacidadRegular + capacidadEspera;
    const inscriptosRegulares = Math.min(inscriptosTotales, capacidadRegular);
    const inscriptosEspera = Math.max(inscriptosTotales - capacidadRegular, 0);
    const cuposDisponibles = Math.max(capacidadRegular - inscriptosRegulares, 0);
    const cuposEsperaDisponibles = Math.max(capacidadEspera - inscriptosEspera, 0);
    const cuposTotalesDisponibles = Math.max(cuposTotales - inscriptosTotales, 0);
    return {
        cupos: capacidadRegular,
        cuposListaEspera: capacidadEspera,
        cuposTotales,
        inscriptosRegulares,
        inscriptosEspera,
        inscriptosTotales,
        cuposDisponibles,
        cuposEsperaDisponibles,
        cuposTotalesDisponibles,
        inscripcionHabilitada: cuposTotalesDisponibles > 0,
    };
};
const estaEnPeriodoInscripcion = ({ fechaInicioInscripcion, fechaFinInscripcion, now, }) => {
    if (fechaInicioInscripcion && now < fechaInicioInscripcion)
        return false;
    if (fechaFinInscripcion && now > fechaFinInscripcion)
        return false;
    return true;
};
const normalizeKey = (key) => key.trim().toLowerCase();
const toRecord = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const getValueByKeys = (source, keys) => {
    const entries = Object.entries(source);
    for (const key of keys) {
        const normalizedTarget = normalizeKey(key);
        const found = entries.find(([entryKey]) => normalizeKey(entryKey) === normalizedTarget);
        if (found)
            return found[1];
    }
    return undefined;
};
const toBoolean = (value) => {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', 'si', 'sí', 'yes', '1'].includes(normalized))
            return true;
        if (['false', 'no', '0'].includes(normalized))
            return false;
    }
    if (typeof value === 'number') {
        if (value === 1)
            return true;
        if (value === 0)
            return false;
    }
    return null;
};
const toNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value === 'string') {
        const parsed = Number(value.replace(',', '.').trim());
        if (Number.isFinite(parsed))
            return parsed;
    }
    return null;
};
const toStringArray = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter((item) => item.length > 0);
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        return [value.trim()];
    }
    return [];
};
const CAMPO_TITULO_DOCENTE = {
    id: 'titulo_docente_tramo_pedagogico',
    label: 'Titulo docente o tramo pedagogico',
    type: 'text',
    required: false,
};
const ensureCampoTituloDocente = (camposRaw) => {
    if (!Array.isArray(camposRaw))
        return camposRaw;
    const idsPermitidos = new Set([
        'titulo_docente_tramo_pedagogico',
        'titulo_docente_o_tramo_pedagogico',
        'titulo_docente',
        'titulo_tramo_pedagogico',
    ]);
    const camposSinTitulo = camposRaw.filter((campo) => {
        if (!campo || typeof campo !== 'object' || Array.isArray(campo))
            return false;
        const id = campo.id;
        return !(typeof id === 'string' && idsPermitidos.has(normalizeKey(id)));
    });
    const indexDistrito = camposSinTitulo.findIndex((campo) => {
        if (!campo || typeof campo !== 'object' || Array.isArray(campo))
            return false;
        const id = campo.id;
        return typeof id === 'string' && normalizeKey(id) === 'distrito_residencia';
    });
    if (indexDistrito >= 0) {
        return [
            ...camposSinTitulo.slice(0, indexDistrito + 1),
            CAMPO_TITULO_DOCENTE,
            ...camposSinTitulo.slice(indexDistrito + 1),
        ];
    }
    return [...camposSinTitulo, CAMPO_TITULO_DOCENTE];
};
const evaluarPrioridadEI = (datosFormularioRaw) => {
    const datosFormulario = toRecord(datosFormularioRaw);
    const poseeTituloValue = getValueByKeys(datosFormulario, ['posee_titulo_docente']);
    const poseeTitulo = toBoolean(poseeTituloValue);
    if (poseeTitulo === false) {
        return {
            estado: 'RECHAZADA',
            prioridad: 0,
            observaciones: 'Rechazada por no cumplir requisito excluyente: titulo docente o tramo pedagogico habilitante.',
        };
    }
    let prioridad = 0;
    const requisitosPrioritariosValue = getValueByKeys(datosFormulario, ['requisitos_prioritarios']);
    const requisitosPrioritarios = toStringArray(requisitosPrioritariosValue).map((value) => value.toLowerCase());
    const enEjercicioValue = getValueByKeys(datosFormulario, ['ejercicio_cargo_actual']);
    const enEjercicio = toBoolean(enEjercicioValue) === true ||
        requisitosPrioritarios.some((item) => item.includes('estar en ejercicio'));
    if (enEjercicio)
        prioridad += 1;
    const nivelDesempenioValue = getValueByKeys(datosFormulario, ['nivel_desempenio']);
    const nivelDesempenioTexto = typeof nivelDesempenioValue === 'string' ? nivelDesempenioValue.toLowerCase() : '';
    const nivelSecundario = nivelDesempenioTexto.includes('secundario') ||
        requisitosPrioritarios.some((item) => item.includes('nivel secundario'));
    if (nivelSecundario)
        prioridad += 1;
    const antiguedadValue = getValueByKeys(datosFormulario, [
        'antiguedad_docente',
        'antiguedad_anios',
        'antiguedad',
    ]);
    const antiguedad = toNumber(antiguedadValue);
    const antiguedadPrioritaria = (antiguedad !== null && antiguedad >= 0 && antiguedad <= 5) ||
        requisitosPrioritarios.some((item) => item.includes('0 y 5'));
    if (antiguedadPrioritaria)
        prioridad += 1;
    return {
        estado: 'PENDIENTE',
        prioridad,
        observaciones: null,
    };
};
const evaluarPrioridadEA = (datosFormularioRaw) => {
    const datosFormulario = toRecord(datosFormularioRaw);
    const poseeTituloValue = getValueByKeys(datosFormulario, ['posee_titulo_docente']);
    const poseeTitulo = toBoolean(poseeTituloValue);
    if (poseeTitulo === false) {
        return {
            estado: 'RECHAZADA',
            prioridad: 0,
            observaciones: 'Rechazada por no cumplir requisito excluyente: titulo docente habilitante para Educacion Secundaria.',
        };
    }
    const requisitosPrioritariosValue = getValueByKeys(datosFormulario, ['requisitos_prioritarios']);
    const requisitosPrioritarios = toStringArray(requisitosPrioritariosValue).map((value) => value.toLowerCase());
    let prioridad = 0;
    const enEjercicioSecundaria = requisitosPrioritarios.some((item) => item.includes('estar en ejercicio') && item.includes('educacion secundaria'));
    if (enEjercicioSecundaria)
        prioridad += 1;
    const equipoGestion = requisitosPrioritarios.some((item) => item.includes('equipo de gestion'));
    if (equipoGestion)
        prioridad += 1;
    const bibliotecario = requisitosPrioritarios.some((item) => item.includes('bibliotecario'));
    if (bibliotecario)
        prioridad += 1;
    return {
        estado: 'PENDIENTE',
        prioridad,
        observaciones: null,
    };
};
const resolveEstadoInscripcion = (evaluacion) => {
    if (evaluacion.estado === 'RECHAZADA') {
        return evaluacion.estado;
    }
    return evaluacion.estado;
};
exports.publicService = {
    // Cohortes en inscripcion (solo datos publicos)
    async getCohortesEnInscripcion() {
        const ahora = new Date();
        const cohortes = await client_2.default.cohorte.findMany({
            where: {
                estado: 'INSCRIPCION',
            },
            select: {
                id: true,
                nombre: true,
                anio: true,
                fechaInicioInscripcion: true,
                fechaFinInscripcion: true,
                cupos: true,
                cuposListaEspera: true,
                cuposTotales: true,
                inscriptos: {
                    select: {
                        estado: true,
                    },
                    where: {
                        estado: {
                            not: 'RECHAZADA',
                        },
                    },
                },
                postitulo: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        requisitos: true,
                        destinatarios: true,
                    },
                },
                formulario: {
                    select: {
                        id: true,
                        nombre: true,
                        campos: true,
                    },
                },
            },
            orderBy: {
                anio: 'desc',
            },
        });
        return cohortes
            .map((cohorte) => {
            const { inscriptos, ...cohorteBase } = cohorte;
            const inscriptosTotales = inscriptos.length;
            const disponibilidad = calcularDisponibilidad({
                cupos: cohorte.cupos,
                cuposListaEspera: cohorte.cuposListaEspera,
                inscriptosTotales,
            });
            const enPeriodo = estaEnPeriodoInscripcion({
                fechaInicioInscripcion: cohorte.fechaInicioInscripcion,
                fechaFinInscripcion: cohorte.fechaFinInscripcion,
                now: ahora,
            });
            const tieneCuposDisponibles = disponibilidad.inscripcionHabilitada;
            return {
                ...cohorteBase,
                formulario: cohorteBase.formulario
                    ? {
                        ...cohorteBase.formulario,
                        campos: ensureCampoTituloDocente(cohorteBase.formulario.campos),
                    }
                    : cohorteBase.formulario,
                ...disponibilidad,
                inscripcionHabilitada: enPeriodo && tieneCuposDisponibles,
                enPeriodoInscripcion: enPeriodo,
                fueraDePeriodoInscripcion: !enPeriodo,
                tieneCuposDisponibles,
                sinCuposDisponibles: !tieneCuposDisponibles,
            };
        });
    },
    // Obtener cohorte publica por ID
    async getCohortePublic(id) {
        const cohorte = await client_2.default.cohorte.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                anio: true,
                fechaInicioInscripcion: true,
                fechaFinInscripcion: true,
                postitulo: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        requisitos: true,
                        destinatarios: true,
                        planEstudios: true,
                        resolucion: true,
                        tipos: {
                            select: {
                                id: true,
                                tipo: true,
                                titulo: true,
                            },
                        },
                    },
                },
                formulario: {
                    select: {
                        id: true,
                        nombre: true,
                        campos: true,
                    },
                },
            },
        });
        if (!cohorte)
            return null;
        return {
            ...cohorte,
            formulario: cohorte.formulario
                ? {
                    ...cohorte.formulario,
                    campos: ensureCampoTituloDocente(cohorte.formulario.campos),
                }
                : cohorte.formulario,
        };
    },
    async validateCohorteDisponibleParaInscripcion(cohorteId, db = client_2.default) {
        const cohorte = await db.cohorte.findUnique({
            where: { id: cohorteId },
            select: {
                id: true,
                estado: true,
                fechaInicioInscripcion: true,
                fechaFinInscripcion: true,
                cupos: true,
                cuposListaEspera: true,
            },
        });
        if (!cohorte) {
            return { error: 'Cohorte no encontrada', code: 404 };
        }
        if (cohorte.estado !== 'INSCRIPCION') {
            return { error: 'La cohorte no esta en periodo de inscripcion', code: 400 };
        }
        const now = new Date();
        if (cohorte.fechaInicioInscripcion && now < cohorte.fechaInicioInscripcion) {
            return { error: 'La inscripcion aun no esta habilitada', code: 400 };
        }
        if (cohorte.fechaFinInscripcion && now > cohorte.fechaFinInscripcion) {
            return { error: 'La inscripcion para esta cohorte ya cerro', code: 400 };
        }
        const inscriptosTotales = await db.inscripto.count({
            where: {
                cohorteId,
                estado: { not: 'RECHAZADA' },
            },
        });
        const disponibilidad = calcularDisponibilidad({
            cupos: cohorte.cupos,
            cuposListaEspera: cohorte.cuposListaEspera,
            inscriptosTotales,
        });
        if (!disponibilidad.inscripcionHabilitada) {
            return { error: 'La cohorte no tiene cupos disponibles', code: 400 };
        }
        return { data: { ...cohorte, ...disponibilidad } };
    },
    async existsInscripcionByCohorteYDni(cohorteId, dni, db = client_2.default) {
        const existente = await db.inscripto.findUnique({
            where: { cohorteId_dni: { cohorteId, dni } },
            select: { id: true },
        });
        return Boolean(existente);
    },
    async createInscripcionPublic(data) {
        for (let attempt = 1; attempt <= MAX_SERIALIZATION_RETRIES; attempt += 1) {
            try {
                return await client_2.default.$transaction(async (tx) => {
                    await tx.$queryRaw `SELECT id FROM Cohorte WHERE id = ${data.cohorteId} FOR UPDATE`;
                    const cohorteResult = await this.validateCohorteDisponibleParaInscripcion(data.cohorteId, tx);
                    if ('error' in cohorteResult && cohorteResult.error) {
                        return cohorteResult;
                    }
                    if (!('data' in cohorteResult) || !cohorteResult.data) {
                        return {
                            error: 'No se pudo validar la disponibilidad de la cohorte',
                            code: 500,
                        };
                    }
                    const disponibilidadActual = cohorteResult.data;
                    const yaExiste = await this.existsInscripcionByCohorteYDni(data.cohorteId, data.dni, tx);
                    if (yaExiste) {
                        return {
                            error: 'Ya existe una inscripcion para este DNI en la cohorte',
                            code: 409,
                        };
                    }
                    const cohorteMeta = await tx.cohorte.findUnique({
                        where: { id: data.cohorteId },
                        select: {
                            postitulo: {
                                select: { codigo: true },
                            },
                        },
                    });
                    const codigoPostitulo = (cohorteMeta?.postitulo?.codigo || '').trim().toUpperCase();
                    const evaluacionPrioridad = codigoPostitulo === 'EI'
                        ? evaluarPrioridadEI(data.datosFormulario)
                        : codigoPostitulo === 'EA'
                            ? evaluarPrioridadEA(data.datosFormulario)
                            : { estado: 'PENDIENTE', prioridad: 0, observaciones: null };
                    const estadoInscripcion = resolveEstadoInscripcion(evaluacionPrioridad);
                    const inscripto = await tx.inscripto.create({
                        data: {
                            cohorteId: data.cohorteId,
                            nombre: data.nombre,
                            apellido: data.apellido,
                            dni: data.dni,
                            email: data.email || null,
                            celular: data.celular || null,
                            datosFormulario: data.datosFormulario ?? null,
                            dniAdjuntoUrl: data.dniAdjuntoUrl || null,
                            tituloAdjuntoUrl: data.tituloAdjuntoUrl || null,
                            estado: estadoInscripcion,
                            prioridad: evaluacionPrioridad.prioridad,
                            observaciones: evaluacionPrioridad.observaciones,
                        },
                        select: {
                            id: true,
                            cohorteId: true,
                            nombre: true,
                            apellido: true,
                            dni: true,
                            email: true,
                            celular: true,
                            estado: true,
                            createdAt: true,
                        },
                    });
                    return { data: inscripto };
                }, {
                    isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2034' &&
                    attempt < MAX_SERIALIZATION_RETRIES) {
                    continue;
                }
                throw error;
            }
        }
        throw new Error('No se pudo completar la inscripcion por conflictos de concurrencia');
    },
};
