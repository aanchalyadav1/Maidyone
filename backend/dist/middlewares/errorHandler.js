"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    (0, responseHandler_1.sendResponse)(res, statusCode, false, message, process.env.NODE_ENV === 'development' ? err.stack : null);
};
exports.errorHandler = errorHandler;
