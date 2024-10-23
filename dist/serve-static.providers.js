"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveStaticProviders = void 0;
const core_1 = require("@nestjs/core");
const abstract_loader_1 = require("./loaders/abstract.loader");
const express_loader_1 = require("./loaders/express.loader");
const fastify_loader_1 = require("./loaders/fastify.loader");
const noop_loader_1 = require("./loaders/noop.loader");
exports.serveStaticProviders = [
    {
        provide: abstract_loader_1.AbstractLoader,
        useFactory: (httpAdapterHost) => {
            if (!httpAdapterHost || !httpAdapterHost.httpAdapter) {
                return new noop_loader_1.NoopLoader();
            }
            const httpAdapter = httpAdapterHost.httpAdapter;
            if (httpAdapter &&
                httpAdapter.constructor &&
                httpAdapter.constructor.name === 'FastifyAdapter') {
                return new fastify_loader_1.FastifyLoader();
            }
            return new express_loader_1.ExpressLoader();
        },
        inject: [core_1.HttpAdapterHost]
    }
];
