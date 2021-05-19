import { Provider } from '@nestjs/common';
import { APP_FILTER, HttpAdapterHost } from '@nestjs/core';
import { NotFoundExceptionFilter } from './filters/not-found-excepion.filter';
import { ServeStaticModuleOptions } from './interfaces/serve-static-options.interface';
import { AbstractLoader } from './loaders/abstract.loader';
import { ExpressLoader } from './loaders/express.loader';
import { FastifyLoader } from './loaders/fastify.loader';
import { NoopLoader } from './loaders/noop.loader';
import { SERVE_STATIC_MODULE_OPTIONS } from './serve-static.constants';

export const serveStaticProviders: Provider[] = [
  {
    provide: AbstractLoader,
    useFactory: (httpAdapterHost: HttpAdapterHost) => {
      if (!httpAdapterHost || !httpAdapterHost.httpAdapter) {
        return new NoopLoader();
      }
      const httpAdapter = httpAdapterHost.httpAdapter;
      if (
        httpAdapter &&
        httpAdapter.constructor &&
        httpAdapter.constructor.name === 'FastifyAdapter'
      ) {
        return new FastifyLoader();
      }
      return new ExpressLoader();
    },
    inject: [HttpAdapterHost]
  },
  {
    provide: APP_FILTER,
    useFactory: (httpAdapterHost: HttpAdapterHost, loader: AbstractLoader, opts: ServeStaticModuleOptions[]) => {
      if( loader instanceof FastifyLoader )
        return new NotFoundExceptionFilter(httpAdapterHost, loader, opts);
    },
    inject: [HttpAdapterHost, AbstractLoader, SERVE_STATIC_MODULE_OPTIONS]
  }
];
