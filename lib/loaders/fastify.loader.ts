import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import * as fs from 'fs';
import { loadPackage } from '../utils/service-static.utils';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class FastifyLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    options: ServeStaticModuleOptions
  ) {
    const app = httpAdapter.getInstance();
    const fastifyStatic = loadPackage(
      'fastify-static',
      'ServeStaticModule',
      () => require('fastify-static')
    );
    const { setHeaders, redirect, ...send } =
      options.serveStaticOptions || ({} as any);
    const clientPath = options.rootPath;
    const indexFilePath = this.getIndexFilePath(clientPath);

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
}
