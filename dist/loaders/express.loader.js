"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressLoader = void 0;
const common_1 = require("@nestjs/common");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const fs = require("fs");
const serve_static_constants_1 = require("../serve-static.constants");
const is_route_excluded_util_1 = require("../utils/is-route-excluded.util");
const validate_path_util_1 = require("../utils/validate-path.util");
const abstract_loader_1 = require("./abstract.loader");
let ExpressLoader = class ExpressLoader extends abstract_loader_1.AbstractLoader {
    register(httpAdapter, optionsArr) {
        const app = httpAdapter.getInstance();
        const express = (0, load_package_util_1.loadPackage)('express', 'ServeStaticModule', () => require('express'));
        optionsArr.forEach(options => {
            options.renderPath = options.renderPath || serve_static_constants_1.DEFAULT_RENDER_PATH;
            const clientPath = options.rootPath || serve_static_constants_1.DEFAULT_ROOT_PATH;
            const indexFilePath = this.getIndexFilePath(clientPath);
            const renderFn = (req, res, next) => {
                if (!(0, is_route_excluded_util_1.isRouteExcluded)(req, options.exclude)) {
                    if (options.serveStaticOptions &&
                        options.serveStaticOptions.setHeaders) {
                        const stat = fs.statSync(indexFilePath);
                        options.serveStaticOptions.setHeaders(res, indexFilePath, stat);
                    }
                    res.sendFile(indexFilePath);
                }
                else {
                    next();
                }
            };
            if (options.serveRoot) {
                app.use(options.serveRoot, express.static(clientPath, options.serveStaticOptions));
                const renderPath = typeof options.serveRoot === 'string'
                    ? options.serveRoot + (0, validate_path_util_1.validatePath)(options.renderPath)
                    : options.serveRoot;
                app.get(renderPath, renderFn);
            }
            else {
                app.use(express.static(clientPath, options.serveStaticOptions));
                app.get(options.renderPath, renderFn);
            }
        });
    }
};
exports.ExpressLoader = ExpressLoader;
exports.ExpressLoader = ExpressLoader = __decorate([
    (0, common_1.Injectable)()
], ExpressLoader);
