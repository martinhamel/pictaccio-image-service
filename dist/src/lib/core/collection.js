"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const tslib_1 = require("tslib");
const entry_1 = require("@loufa/loufairy-server/src/entry");
const events_1 = require("events");
const path_1 = tslib_1.__importDefault(require("path"));
const logger_1 = require("../../lib/core/logger");
class Collection extends events_1.EventEmitter {
    _directory;
    _options;
    _collection = {};
    constructor(_directory, _options) {
        super();
        this._directory = _directory;
        this._options = _options;
        if (typeof this._options.factory !== 'function') {
            this._options.factory = async (file) => (await Promise.resolve(`${file}`).then(s => tslib_1.__importStar(require(s)))).default;
        }
        this._loadCollection().then(() => this.emit('ready', this));
    }
    *each() {
        for (const item of Object.values(this._collection)) {
            if (item.imported) {
                yield item;
            }
        }
    }
    execEach(callable) {
        for (const item of this.each()) {
            callable(item);
        }
    }
    async importAll() {
        for (const [name, item] of Object.entries(this._collection)) {
            logger_1.logger.debug(`Importing ${item.file} from ${item.parent}`, {
                area: 'core',
                subarea: 'collection',
                action: 'loading-script',
                path: path_1.default.join(item.parent, item.file)
            });
            this._collection[name].obj = await this._options.factory(path_1.default.join(item.parent, item.file));
            this._collection[name].imported = true;
        }
        this.emit('imported-all', this);
    }
    async _loadCollection() {
        if (!Array.isArray(this._directory)) {
            this._directory = [this._directory];
        }
        for (const directory of this._directory) {
            try {
                for await (const file of (0, entry_1.readDir)(directory, this._options.filter)) {
                    this._collection[path_1.default.basename(file.name)] = {
                        file: file.name,
                        parent: directory,
                        imported: false
                    };
                }
            }
            catch (e) {
            }
        }
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map