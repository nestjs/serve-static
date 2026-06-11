import { Provider } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AbstractLoader } from './loaders/abstract.loader.js';
import { ExpressLoader } from './loaders/express.loader.js';
import { FastifyLoader } from './loaders/fastify.loader.js';
import { NoopLoader } from './loaders/noop.loader.js';

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
  }
];
