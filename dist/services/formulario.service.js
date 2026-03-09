"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formularioService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const CAMPO_TITULO_DOCENTE = {
    id: 'titulo_docente_tramo_pedagogico',
    label: 'Titulo docente o tramo pedagogico',
    type: 'text',
    required: false,
};
const normalizeKey = (key) => key.trim().toLowerCase();
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
const extractRequisitos = (camposRaw) => {
    if (!Array.isArray(camposRaw)) {
        return { excluyentes: [], prioritarios: [] };
    }
    const byId = (id) => camposRaw.find((campo) => {
        if (!campo || typeof campo !== 'object' || Array.isArray(campo))
            return false;
        const value = campo.id;
        return typeof value === 'string' && normalizeKey(value) === normalizeKey(id);
    });
    const campoExcluyente = byId('posee_titulo_docente');
    const excluyenteLabel = campoExcluyente && typeof campoExcluyente.label === 'string'
        ? campoExcluyente.label.trim()
        : '';
    const campoPrioritarios = byId('requisitos_prioritarios');
    const prioritarios = Array.isArray(campoPrioritarios?.options)
        ? campoPrioritarios.options
            .map((item) => String(item || '').trim())
            .filter((item) => item.length > 0)
        : [];
    return {
        excluyentes: excluyenteLabel ? [excluyenteLabel] : [],
        prioritarios,
    };
};
exports.formularioService = {
    // Obtener todos los formularios (opcionalmente filtrados por postitulo)
    async getAll(postituloId) {
        const where = postituloId ? { postituloId } : undefined;
        const formularios = await client_1.default.formulario.findMany({
            where,
            include: {
                postitulo: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        requisitos: true,
                        descripcion: true,
                        destinatarios: true,
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
                cohortes: {
                    select: {
                        id: true,
                        nombre: true,
                        estado: true,
                        fechaInicioInscripcion: true,
                        fechaFinInscripcion: true,
                        cupos: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return formularios.map((formulario) => {
            const campos = ensureCampoTituloDocente(formulario.campos);
            return {
                ...formulario,
                campos,
                requisitos: extractRequisitos(campos),
            };
        });
    },
    // Obtener formulario por ID
    async getById(id) {
        const formulario = await client_1.default.formulario.findUnique({
            where: { id },
            include: {
                postitulo: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        requisitos: true,
                        descripcion: true,
                        destinatarios: true,
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
                cohortes: {
                    select: {
                        id: true,
                        nombre: true,
                        estado: true,
                        fechaInicioInscripcion: true,
                        fechaFinInscripcion: true,
                        cupos: true,
                    },
                },
            },
        });
        if (!formulario)
            return null;
        const campos = ensureCampoTituloDocente(formulario.campos);
        return {
            ...formulario,
            campos,
            requisitos: extractRequisitos(campos),
        };
    },
};
