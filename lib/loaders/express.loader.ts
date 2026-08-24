import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util.js';
import { AbstractHttpAdapter, ApplicationConfig } from '@nestjs/core';
import * as fs from 'fs';
import { createRequire } from 'module';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface.js';
import {
  DEFAULT_EXPRESS_RENDER_PATH,
  DEFAULT_ROOT_PATH
} from '../serve-static.constants.js';
import { isRouteExcluded } from '../utils/is-route-excluded.util.js';
import { validateGlobalPrefix } from '../utils/validate-global-prefix.util.js';
import { validatePath } from '../utils/validate-path.util.js';
import { AbstractLoader } from './abstract.loader.js';

const require = createRequire(import.meta.url);

@Injectable()
export class ExpressLoader extends AbstractLoader {
  private readonly logger = new Logger(ExpressLoader.name);

  public register(
    httpAdapter: AbstractHttpAdapter,
    config: ApplicationConfig,
    optionsArr: ServeStaticModuleOptions[]
  ) {
    const app = httpAdapter.getInstance();
    const globalPrefix = config.getGlobalPrefix();
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
            if (!err) {
              return;
            }
            // This callback also fires once the response is already on the
            // wire. Responding then throws ERR_HTTP_HEADERS_SENT from inside
            // sendFile's own callback, outside the middleware chain and any
            // exception filter, so it takes down the process instead of
            // failing the one request.
            if (res.headersSent) {
              // A client abort is routine and the socket is already gone. A
              // read error mid-transfer is not: `send` has committed a
              // Content-Length the truncated body can no longer satisfy, so
              // ending the response leaves the client waiting for bytes that
              // will never arrive. Tearing the connection down is the only way
              // to release it.
              if ((err as NodeJS.ErrnoException).code !== 'ECONNABORTED') {
                this.logger.error(
                  `Failed to send "${indexFilePath}" after the response had started: ${err.message}`
                );
              }
              res.destroy();
              return;
            }
            // Report a plain miss rather than the underlying ENOENT, whose
            // message echoes the resolved filesystem path back to the client.
            const method = httpAdapter.getRequestMethod(req);
            const url = httpAdapter.getRequestUrl(req);
            const error = new NotFoundException(`Cannot ${method} ${url}`);
            res.status(error.getStatus()).send(error.getResponse());
          });
        } else {
          next();
        }
      };

      if (
        globalPrefix &&
        options.useGlobalPrefix &&
        validateGlobalPrefix(globalPrefix)
      ) {
        options.serveRoot = `/${globalPrefix}${options.serveRoot || ''}`;
      }

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

      app.use((err: any, req: any, _res: any, next: Function) => {
        // Anything the application raised is already a deliberate response.
        if (err instanceof HttpException) {
          throw err;
        }

        const isMissingFile =
          err?.code === 'ENOENT' || err?.message?.includes('ENOENT');

        // Only a missing file is this middleware's business. Rewriting any
        // other failure as a 404 would report a genuine server fault as a
        // client error, so it never reaches an exception filter or 5xx alert.
        if (!isMissingFile) {
          return next(err);
        }

        // Report a plain miss rather than the underlying ENOENT, whose
        // message echoes the resolved filesystem path back to the client.
        const method = httpAdapter.getRequestMethod(req);
        const url = httpAdapter.getRequestUrl(req);
        return next(new NotFoundException(`Cannot ${method} ${url}`));
      });
    });
  }
}
