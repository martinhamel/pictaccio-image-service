"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendgridMailerService = void 0;
const tslib_1 = require("tslib");
const typedi_1 = require("typedi");
const mail_1 = tslib_1.__importDefault(require("@sendgrid/mail"));
const logger_1 = require("../../lib/core/logger");
const config_1 = require("../../config");
mail_1.default.setApiKey(config_1.config.sendgrid.apikey);
let SendgridMailerService = class SendgridMailerService {
    async send(item) {
        const msg = {
            from: item.from,
            to: item.to,
            cc: item.cc,
            bcc: item.bcc,
            subject: item.subject,
            html: item.message
        };
        try {
            await mail_1.default.send(msg);
            logger_1.logger.info(`Successfully sent an email`, {
                area: 'services',
                subarea: 'mailer:sendgrid',
                action: 'send-email',
                result: 'success',
                msg
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to send an email`, {
                area: 'services',
                subarea: 'mailer:sendgrid',
                action: 'send-email',
                result: 'failed',
                msg,
                error
            });
            throw new Error(`Failed to send email: ${error.message} ${error.stack}`);
        }
    }
};
exports.SendgridMailerService = SendgridMailerService;
exports.SendgridMailerService = SendgridMailerService = tslib_1.__decorate([
    (0, typedi_1.Service)('mailer')
], SendgridMailerService);
//# sourceMappingURL=sendgrid_mailer_service.js.map