"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nextLoader = void 0;
exports.getFixedT = getFixedT;
const tslib_1 = require("tslib");
const js_yaml_1 = require("js-yaml");
const i18next_1 = tslib_1.__importStar(require("i18next"));
const i18next_fs_backend_1 = tslib_1.__importDefault(require("i18next-fs-backend"));
const typedi_1 = require("typedi");
const logger_1 = require("../../lib/core/logger");
const loaded = [];
async function getFixedT(lang) {
    if (!loaded.includes(lang)) {
        await i18next_1.default.reloadResources(lang);
        loaded.push(lang);
    }
    return (0, i18next_1.getFixedT)(lang);
}
const i18nextLoader = async () => {
    const config = typedi_1.Container.get('config');
    i18next_1.default.on('failedLoading', (lang, namespace, key) => {
        logger_1.logger.info('Translation loading failed', {
            area: 'loaders',
            subarea: 'i18next',
            action: 'localizing',
            lang,
            namespace,
            key
        });
    });
    i18next_1.default.on('missingKey', (lang, namespace, key) => {
        logger_1.logger.info('Missing key detected', {
            area: 'loaders',
            subarea: 'i18next',
            action: 'localizing',
            lang,
            namespace,
            key
        });
    });
    await i18next_1.default
        .use(i18next_fs_backend_1.default)
        .init({
        debug: false,
        load: 'languageOnly',
        lng: config.locales.fallbacks.lang,
        supportedLngs: config.locales.supported,
        defaultNS: 'common',
        ns: [
            'common',
            'messages'
        ],
        saveMissing: true,
        saveMissingTo: 'all',
        backend: {
            loadPath: config.env.dirs.locales,
            parse: async function (data) {
                return await (0, js_yaml_1.load)(data);
            }
        }
    });
    loaded.push(config.locales.fallbacks.lang);
    logger_1.logger.info('Initialized i18next', {
        area: 'loaders',
        subarea: 'i18next',
        action: 'loading'
    });
};
exports.i18nextLoader = i18nextLoader;
//# sourceMappingURL=i18next.js.map