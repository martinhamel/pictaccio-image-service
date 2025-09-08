"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpCommonFields = httpCommonFields;
function httpCommonFields(request) {
    return {
        access_granted: request.permissions?.filter(permission => permission.granted).length !== 0,
        correlation_id: request.correlationId,
        http_method: request.method,
        resource_name: request.url,
        session_id: request.session.id,
        src_ip: request.ip,
        src_user_email: request.user?.email,
        src_user_id: request.user?.id,
        src_user_roles: request.user?.roles
    };
}
//# sourceMappingURL=logger_common.js.map