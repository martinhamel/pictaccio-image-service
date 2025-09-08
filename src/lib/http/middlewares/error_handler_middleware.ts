import { Response, NextFunction } from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from '@loufa/routing-controllers';
import { Service } from 'typedi';
import { logger } from '@pictaccio/image-service/src/lib/core/logger';
import { httpCommonFields } from '@pictaccio/image-service/src/lib/core/logger_common';
import { Request } from '@pictaccio/image-service/src/lib/core/request';

/**
 * Handles errors and logs them
 */
@Service()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    public error(error: HttpError, request: Request, response: Response, next: NextFunction): void {
        let accessError = false;

        // @ts-ignore
        if (error.code === 'ERR_HTTP_HEADERS_SENT') {
            next();
            return;
        }

        logger.error(
            `Error while processing request from ${request.ip} for ${request.url}. ` +
            `Error: ${error.name} ${error.message}`, {
            error,
            area: 'http',
            subarea: 'middlewares/error-handler',
            action: 'logging',
            session_id: request.session.id,
            http_method: request.method,
            data: {
                headers: request.headers,
                query: request.query,
                body: request.body
            },
            ...httpCommonFields(request)
        });

        if (error.name === 'AccessDeniedError') {
            accessError = true
        }

        response.status(accessError ? 403 : (error.httpCode || 500));
        response.json({
            status: 'error',
            context: ['AccessDeniedError'].includes(error.name) ? error.name : 'UNKNOWN_ERROR',
            correlationId: request.correlationId
        });
        next();
    }
}
