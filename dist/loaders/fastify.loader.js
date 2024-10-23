"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastifyLoader = void 0;
const common_1 = require("@nestjs/common");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const fs = require("fs");
const serve_static_constants_1 = require("../serve-static.constants");
const validate_path_util_1 = require("../utils/validate-path.util");
const abstract_loader_1 = require("./abstract.loader");
let FastifyLoader = class FastifyLoader extends abstract_loader_1.AbstractLoader {
    register(httpAdapter, optionsArr) {
        const app = httpAdapter.getInstance();
        const fastifyStatic = (0, load_package_util_1.loadPackage)('@fastify/static', 'ServeStaticModule', () => require('@fastify/static'));
        optionsArr.forEach((options) => {
            options.renderPath = options.renderPath || serve_static_constants_1.DEFAULT_RENDER_PATH;
            const clientPath = options.rootPath || serve_static_constants_1.DEFAULT_ROOT_PATH;
            const indexFilePath = this.getIndexFilePath(clientPath);
            if (options.serveRoot) {
                app.register(fastifyStatic, {
                    root: clientPath,
                    ...(options.serveStaticOptions || {}),
                    wildcard: false,
                    prefix: options.serveRoot
                });
                const renderPath = typeof options.serveRoot === 'string'
                    ? options.serveRoot + (0, validate_path_util_1.validatePath)(options.renderPath)
                    : options.serveRoot;
                app.get(renderPath, (req, res) => {
                    const stream = fs.createReadStream(indexFilePath);
                    res.type('text/html').send(stream);
                });
            }
            else {
                app.register(fastifyStatic, {
                    root: clientPath,
                    ...(options.serveStaticOptions || {}),
                    wildcard: false
                });
                app.get(options.renderPath, (req, res) => {
                    const stream = fs.createReadStream(indexFilePath);
                    if (options.serveStaticOptions &&
                        options.serveStaticOptions.setHeaders) {
                        const stat = fs.statSync(indexFilePath);
                        options.serveStaticOptions.setHeaders(res, indexFilePath, stat);
                    }
                    res.type('text/html').send(stream);
                });
            }
        });
    }
};
exports.FastifyLoader = FastifyLoader;
exports.FastifyLoader = FastifyLoader = __decorate([
    (0, common_1.Injectable)()
], FastifyLoader);
