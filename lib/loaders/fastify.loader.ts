import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import * as fs from 'fs';
import { loadPackage } from '../utils/service-static.utils';
import { AngularModuleOptions } from '../interfaces/angular-options.interface';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class FastifyLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    options: AngularModuleOptions,
  ) {
    const app = httpAdapter.getInstance();
    const fastifyStatic = loadPackage('fastify-static', 'AngularModule', () =>
      require('fastify-static'),
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
    });
    app.get(options.renderPath, (req: any, res: any) => {
      const stream = fs.createReadStream(indexFilePath);
      res.type('text/html').send(stream);
    });
  }
}
