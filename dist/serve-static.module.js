"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ServeStaticModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServeStaticModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const abstract_loader_1 = require("./loaders/abstract.loader");
const serve_static_constants_1 = require("./serve-static.constants");
const serve_static_providers_1 = require("./serve-static.providers");
let ServeStaticModule = ServeStaticModule_1 = class ServeStaticModule {
    constructor(ngOptions, loader, httpAdapterHost) {
        this.ngOptions = ngOptions;
        this.loader = loader;
        this.httpAdapterHost = httpAdapterHost;
    }
    static forRoot(...options) {
        return {
            module: ServeStaticModule_1,
            providers: [
                {
                    provide: serve_static_constants_1.SERVE_STATIC_MODULE_OPTIONS,
                    useValue: options
                }
            ]
        };
    }
    static forRootAsync(options) {
        return {
            module: ServeStaticModule_1,
            imports: options.imports,
            providers: [
                ...this.createAsyncProviders(options),
                ...(options.extraProviders || [])
            ],
            exports: [serve_static_constants_1.SERVE_STATIC_MODULE_OPTIONS]
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass
            }
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: serve_static_constants_1.SERVE_STATIC_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }
        return {
            provide: serve_static_constants_1.SERVE_STATIC_MODULE_OPTIONS,
            useFactory: async (optionsFactory) => optionsFactory.createLoggerOptions(),
            inject: [options.useExisting || options.useClass]
        };
    }
    async onModuleInit() {
        const httpAdapter = this.httpAdapterHost.httpAdapter;
        this.loader.register(httpAdapter, this.ngOptions);
    }
};
exports.ServeStaticModule = ServeStaticModule;
exports.ServeStaticModule = ServeStaticModule = ServeStaticModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [...serve_static_providers_1.serveStaticProviders]
    }),
    __param(0, (0, common_1.Inject)(serve_static_constants_1.SERVE_STATIC_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Array, abstract_loader_1.AbstractLoader,
        core_1.HttpAdapterHost])
], ServeStaticModule);
