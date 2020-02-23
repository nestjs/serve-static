import { Injectable } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { AbstractHttpAdapter } from '@nestjs/core';
import * as fs from 'fs';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
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
      'fastify-static',
      'ServeStaticModule',
      () => require('fastify-static')
    );

    optionsArr.forEach(options => {
      const { setHeaders, redirect, ...send } =
        options.serveStaticOptions || ({} as any);
      const clientPath = options.rootPath;
      const indexFilePath = this.getIndexFilePath(clientPath);

      if (options.serveRoot) {
        app.register(fastifyStatic, {
          root: clientPath,
          setHeaders,
          redirect,
          send,
          wildcard: false,
          prefix: options.serveRoot
        });

        const renderPath =
          typeof options.serveRoot === 'string'
            ? options.serveRoot + validatePath(options.renderPath as string)
            : options.serveRoot;

        app.get(renderPath, (req: any, res: any) => {
          const stream = fs.createReadStream(indexFilePath);
          res.type('text/html').send(stream);
        });
      } else {
        app.register(fastifyStatic, {
          root: clientPath,
          setHeaders,
          redirect,
          send,
          wildcard: false
        });
        app.get(options.renderPath, (req: any, res: any) => {
          const stream = fs.createReadStream(indexFilePath);
          res.type('text/html').send(stream);
        });
      }
    });
  }
}
