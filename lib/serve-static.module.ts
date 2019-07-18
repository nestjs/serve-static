import { DynamicModule, Inject, Module, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  SERVE_STATIC_MODULE_OPTIONS,
  DEFAULT_RENDER_PATH,
  DEFAULT_ROOT_PATH
} from './serve-static.constants';
import { serveStaticProviders } from './serve-static.providers';
import { ServeStaticModuleOptions } from './interfaces/serve-static-options.interface';
import { AbstractLoader } from './loaders/abstract.loader';

@Module({
  providers: [...serveStaticProviders]
})
export class ServeStaticModule implements OnModuleInit {
  constructor(
    @Inject(SERVE_STATIC_MODULE_OPTIONS)
    private readonly ngOptions: ServeStaticModuleOptions,
    private readonly loader: AbstractLoader,
    private readonly httpAdapterHost: HttpAdapterHost
  ) {}

  public static forRoot(options: ServeStaticModuleOptions = {}): DynamicModule {
    options.rootPath = options.rootPath || DEFAULT_ROOT_PATH;
    options.renderPath = options.renderPath || DEFAULT_RENDER_PATH;
    return {
      module: ServeStaticModule,
      providers: [
        {
          provide: SERVE_STATIC_MODULE_OPTIONS,
          useValue: options
        }
      ]
    };
  }

  public async onModuleInit() {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    this.loader.register(httpAdapter, this.ngOptions);
  }
}
