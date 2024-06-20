exports.STATUS_CODE = Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    CONTENT_NOT_AVAILABLE: 410,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
});

exports.ROLES = Object.freeze({
    ADMIN: 'admin',
    USER: 'user',
    ORGANIZATION: 'organization'
})