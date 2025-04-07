import {
  DynamicModule,
  Inject,
  Module,
  OnModuleInit,
  Provider
} from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import {
  ServeStaticModuleAsyncOptions,
  ServeStaticModuleOptions,
  ServeStaticModuleOptionsFactory
} from './interfaces/serve-static-options.interface';
import { AbstractLoader } from './loaders/abstract.loader';
import { SERVE_STATIC_MODULE_OPTIONS } from './serve-static.constants';
import { serveStaticProviders } from './serve-static.providers';

/**
 * @publicApi
 */
@Module({
  providers: [...serveStaticProviders]
})
export class ServeStaticModule implements OnModuleInit {
  constructor(
    @Inject(SERVE_STATIC_MODULE_OPTIONS)
    private readonly moduleOptions: ServeStaticModuleOptions[],
    private readonly loader: AbstractLoader,
    private readonly config: ApplicationConfig,
    private readonly httpAdapterHost: HttpAdapterHost
  ) {}

  public static forRoot(...options: ServeStaticModuleOptions[]): DynamicModule {
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

  public static forRootAsync(
    options: ServeStaticModuleAsyncOptions
  ): DynamicModule {
    return {
      module: ServeStaticModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || [])
      ],
      exports: [SERVE_STATIC_MODULE_OPTIONS]
    };
  }

  private static createAsyncProviders(
    options: ServeStaticModuleAsyncOptions
  ): Provider[] {
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

  private static createAsyncOptionsProvider(
    options: ServeStaticModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: SERVE_STATIC_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }
    return {
      provide: SERVE_STATIC_MODULE_OPTIONS,
      useFactory: async (optionsFactory: ServeStaticModuleOptionsFactory) =>
        optionsFactory.createLoggerOptions(),
      inject: [options.useExisting || options.useClass]
    };
  }

  public onModuleInit() {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    this.loader.register(httpAdapter, this.config, this.moduleOptions);
  }
}
