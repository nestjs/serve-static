import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import * as fs from 'fs';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class FastifyLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    options: ServeStaticModuleOptions[]
  ) {
    const app = httpAdapter.getInstance();
    const fastifyStatic = loadPackage(
      'fastify-static',
      'ServeStaticModule',
      () => require('fastify-static')
    );

    options.forEach(option => {
      const { setHeaders, redirect, ...send } =
        option.serveStaticOptions || ({} as any);
      const clientPath = option.rootPath;
      const indexFilePath = this.getIndexFilePath(clientPath);

      app.register(fastifyStatic, {
        root: clientPath,
        prefix: option.renderPath,
        setHeaders,
        redirect,
        send,
        decorateReply: options.length === 1
      });

      app.get(option.renderPath, (req: any, res: any) => {
        const stream = fs.createReadStream(indexFilePath);
        res.type('text/html').send(stream);
      });
    });
  }
}
