"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const saml2_js_1 = require("saml2-js");
const typedi_1 = require("typedi");
const logger_1 = require("../../lib/core/logger");
const config_1 = require("../../config");
const serviceProvider = new saml2_js_1.ServiceProvider({
    entity_id: config_1.config.saml.serviceProviderEntityId,
    private_key: config_1.config.saml.serviceProviderPrivateKey,
    certificate: config_1.config.saml.serviceProviderCertificate,
    assert_endpoint: config_1.config.saml.serviceProviderAssertEndpoint,
    allow_unencrypted_assertion: true
});
const identityProvider = new saml2_js_1.IdentityProvider({
    sso_login_url: config_1.config.saml.identityProviderLoginURL,
    sso_logout_url: config_1.config.saml.identityProviderLogoutURL,
    certificates: config_1.config.saml.identityProviderCertificates
});
let Saml2Service = class Saml2Service {
    createMetadata() {
        return serviceProvider.create_metadata;
    }
    login(options) {
        return new Promise((resolve, reject) => {
            serviceProvider.create_login_request_url(identityProvider, options, (error, loginUrl, requestId) => {
                if (error !== null) {
                    logger_1.logger.error(`Failed to create SAML2 login request url`, {
                        area: 'services',
                        subarea: 'saml2',
                        action: 'user:login',
                        result: 'failed',
                        error
                    });
                    reject(error);
                    return;
                }
                logger_1.logger.info(`Created SAML2 login request url`, {
                    area: 'services',
                    subarea: 'saml2',
                    action: 'user:login',
                    result: 'success',
                    login_url: loginUrl,
                    request_id: requestId
                });
                resolve({
                    loginUrl,
                    requestId
                });
            });
        });
    }
    assert(options) {
        return new Promise((resolve, reject) => {
            serviceProvider.post_assert(identityProvider, options, (error, samlResponse) => {
                if (error !== null) {
                    logger_1.logger.error(`Failed to assert`, {
                        area: 'services',
                        subarea: 'saml2',
                        action: 'user:saml-assert',
                        result: 'failed',
                        error
                    });
                    reject(error);
                    return;
                }
                logger_1.logger.info(`Sucessfully posted assertion`, {
                    area: 'services',
                    subarea: 'saml2',
                    action: 'user:saml-assert',
                    result: 'success',
                    saml_response: samlResponse
                });
                resolve({
                    samlResponse
                });
            });
        });
    }
    logout(options) {
        return new Promise((resolve, reject) => {
            serviceProvider.create_logout_request_url(identityProvider, options, (error, logoutUrl) => {
                if (error !== null) {
                    logger_1.logger.error(`Failed to logout`, {
                        area: 'services',
                        subarea: 'saml2',
                        action: 'user:logout',
                        result: 'failed',
                        error
                    });
                    reject(error);
                    return;
                }
                logger_1.logger.info(`Sucessfully logged out`, {
                    area: 'services',
                    subarea: 'saml2',
                    action: 'user:saml-assert',
                    result: 'success',
                    logout_url: logoutUrl
                });
                resolve({
                    logoutUrl
                });
            });
        });
    }
};
Saml2Service = tslib_1.__decorate([
    (0, typedi_1.Service)('saml2')
], Saml2Service);
//# sourceMappingURL=saml2_service.js.map