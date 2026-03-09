"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data = null, meta = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(meta && { meta }),
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, code = 500, details = null) => {
    return res.status(code).json({
        success: false,
        message,
        error: {
            code,
            details,
        },
    });
};
exports.sendError = sendError;
