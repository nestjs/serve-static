import { Injectable } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { AbstractHttpAdapter } from '@nestjs/core';
import * as fs from 'fs';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import {
  DEFAULT_RENDER_PATH,
  DEFAULT_ROOT_PATH
} from '../serve-static.constants';
import { validatePath } from '../utils/validate-path.util';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class FastifyLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    optionsArr: ServeStaticModuleOptions[]
  ) {
    const app = httpAdapter.getInstance();
    const fastifyStatic = loadPackage(
      '@fastify/static',
      'ServeStaticModule',
      () => require('@fastify/static')
    );

    optionsArr.forEach((options) => {
      options.renderPath = options.renderPath || DEFAULT_RENDER_PATH;

      const clientPath = options.rootPath || DEFAULT_ROOT_PATH;

      if (options.serveRoot) {
        app.register(fastifyStatic, {
          root: clientPath,
          ...(options.serveStaticOptions || {}),
          prefix: options.serveRoot
        });
      } else {
        app.register(fastifyStatic, {
          root: clientPath,
          ...(options.serveStaticOptions || {})
        });
      }
    });
  }
}
