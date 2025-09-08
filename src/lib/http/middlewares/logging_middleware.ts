import { NextFunction, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from '@loufa/routing-controllers';
import { Service } from 'typedi';
import { logger } from '../../../lib/core/logger';
import { httpCommonFields } from '../../../lib/core/logger_common';
import { Request } from '../../../lib/core/request';

/**
 * This logs all the requests the application handles
 */
@Service()
@Middleware({ type: 'before' })
export class LoggingHandlerMiddleware implements ExpressMiddlewareInterface {
    /**
     * Log a request
     * @param request The request that will be logged
     * @param response The response, unused
     * @param next A callback to keep the request processing moving
     */
    public use(request: Request, response: Response, next: NextFunction): any {
        logger.info(`Processing request ${request.url} from ${request.ip}`, {
            area: 'http',
            subarea: 'middlewares/logging',
            action: 'logging',
            data: {
                headers: request.headers,
                query: request.query,
                body: request.body
            },
            ...httpCommonFields(request)
        });
        next();
    }
}
