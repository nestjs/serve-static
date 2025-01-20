import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { AbstractHttpAdapter } from '@nestjs/core';
import * as fs from 'fs';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import {
  DEFAULT_EXPRESS_RENDER_PATH,
  DEFAULT_ROOT_PATH
} from '../serve-static.constants';
import { isRouteExcluded } from '../utils/is-route-excluded.util';
import { validatePath } from '../utils/validate-path.util';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class ExpressLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    optionsArr: ServeStaticModuleOptions[]
  ) {
    const app = httpAdapter.getInstance();
    const express = loadPackage('express', 'ServeStaticModule', () =>
      require('express')
    );
    optionsArr.forEach((options) => {
      options.renderPath = options.renderPath ?? DEFAULT_EXPRESS_RENDER_PATH;
      const clientPath = options.rootPath ?? DEFAULT_ROOT_PATH;
      const indexFilePath = this.getIndexFilePath(clientPath);

      const renderFn = (req: unknown, res: any, next: Function) => {
        if (!isRouteExcluded(req, options.exclude)) {
          if (options.serveStaticOptions?.setHeaders) {
            const stat = fs.statSync(indexFilePath);
            options.serveStaticOptions.setHeaders(res, indexFilePath, stat);
          }
          res.sendFile(indexFilePath, null, (err: Error) => {
            if (err) {
              const error = new NotFoundException(err.message);
              res.status(error.getStatus()).send(error.getResponse());
            }
          });
        } else {
          next();
        }
      };

      if (options.serveRoot) {
        app.use(
          options.serveRoot,
          express.static(clientPath, options.serveStaticOptions)
        );
        const renderPath =
          typeof options.serveRoot === 'string'
            ? options.serveRoot + validatePath(options.renderPath as string)
            : options.serveRoot;

        app.get(renderPath, renderFn);
      } else {
        app.use(express.static(clientPath, options.serveStaticOptions));
        app.get(options.renderPath, renderFn);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      app.use((err: any, _req: any, _res: any, _next: Function) => {
        if (err instanceof HttpException) {
          throw err;
        } else if (err?.message?.includes('ENOENT') || err?.code === 'ENOENT') {
          throw new NotFoundException(err.message);
        }
      });
    });
  }
}
