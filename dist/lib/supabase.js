"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseBucket = exports.getSupabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
let supabaseAdmin = null;
const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en variables de entorno');
    }
    if (!supabaseAdmin) {
        supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
    }
    return supabaseAdmin;
};
exports.getSupabaseAdmin = getSupabaseAdmin;
const getSupabaseBucket = () => {
    const bucket = process.env.SUPABASE_BUCKET;
    if (!bucket)
        throw new Error('Falta SUPABASE_BUCKET en variables de entorno');
    return bucket;
};
exports.getSupabaseBucket = getSupabaseBucket;
