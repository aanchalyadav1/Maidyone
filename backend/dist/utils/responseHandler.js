"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, statusCode, success, message, data = null) => {
    let pagination;
    let finalData = data;
    if (data && typeof data === 'object' && data.pagination) {
        pagination = data.pagination;
        finalData = Object.assign({}, data);
        delete finalData.pagination;
        // If the data object only had pagination and one other key (like 'users', 'workers'),
        // the frontend might expect that key to be inside `data` or we can just leave it as is.
        // The previous implementation returned: data: { users, pagination }.
        // So finalData will now just be { users }.
    }
    return res.status(statusCode).json(Object.assign({ success,
        message, data: finalData }, (pagination && { pagination })));
};
exports.sendResponse = sendResponse;
