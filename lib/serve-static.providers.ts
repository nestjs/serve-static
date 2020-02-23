import { Provider } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AbstractLoader } from './loaders/abstract.loader';
import { ExpressLoader } from './loaders/express.loader';
import { FastifyLoader } from './loaders/fastify.loader';
import { NoopLoader } from './loaders/noop.loader';

export const serveStaticProviders: Provider[] = [
  {
    provide: AbstractLoader,
    useFactory: (httpAdapterHost: HttpAdapterHost) => {
      if (!httpAdapterHost) {
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
