"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const instituto_routes_1 = __importDefault(require("./routes/instituto.routes"));
const distrito_routes_1 = __importDefault(require("./routes/distrito.routes"));
const postitulo_routes_1 = __importDefault(require("./routes/postitulo.routes"));
const aulas_routes_1 = __importDefault(require("./routes/aulas.routes"));
const cursante_routes_1 = __importDefault(require("./routes/cursante.routes"));
const cohorte_routes_1 = __importDefault(require("./routes/cohorte.routes"));
const formulario_routes_1 = __importDefault(require("./routes/formulario.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const inscripto_routes_1 = __importDefault(require("./routes/inscripto.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// --- Middlewares ---
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // ✅ permite cookies
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); // ✅ debe ir antes de las rutas
// --- Rutas ---
app.get('/', (_, res) => res.send('✅ API Postítulos funcionando'));
app.use('/api/public', public_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/institutos', instituto_routes_1.default);
app.use('/api/distritos', distrito_routes_1.default);
app.use('/api/postitulos', postitulo_routes_1.default);
app.use('/api/aulas', aulas_routes_1.default);
app.use('/api/cursantes', cursante_routes_1.default);
app.use('/api/cohortes', cohorte_routes_1.default);
app.use('/api/formularios', formulario_routes_1.default);
app.use('/api/inscripciones', inscripto_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
// --- Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
