import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { loadPackageSync } from '@nestjs/common/utils/load-package.util.js';
import { AbstractHttpAdapter, ApplicationConfig } from '@nestjs/core';
import * as fs from 'fs';
import { createRequire } from 'module';
import { basename, dirname } from 'path';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface.js';
import {
  DEFAULT_EXPRESS_RENDER_PATH,
  DEFAULT_ROOT_PATH
} from '../serve-static.constants.js';
import { isRouteExcluded } from '../utils/is-route-excluded.util.js';
import { normalizeGlobalPrefix } from '../utils/normalize-global-prefix.util.js';
import { validateGlobalPrefix } from '../utils/validate-global-prefix.util.js';
import { validatePath } from '../utils/validate-path.util.js';
import { AbstractLoader } from './abstract.loader.js';

const require = createRequire(import.meta.url);

@Injectable()
export class ExpressLoader extends AbstractLoader {
  private readonly logger = new Logger(this.constructor.name);

  public register(
    httpAdapter: AbstractHttpAdapter,
    config: ApplicationConfig,
    optionsArr: ServeStaticModuleOptions[]
  ) {
    const app = httpAdapter.getInstance();
    const globalPrefix = config.getGlobalPrefix();
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

          if (options.transformIndexHtml) {
            fs.readFile(indexFilePath, 'utf8', (err, data) => {
              if (err) {
                // Report a plain miss rather than the underlying ENOENT, whose
                // message echoes the resolved filesystem path back to the client.
                const method = httpAdapter.getRequestMethod(req);
                const url = httpAdapter.getRequestUrl(req);
                next(new NotFoundException(`Cannot ${method} ${url}`));
                return;
              }

              Promise.resolve(options.transformIndexHtml!(data, req))
                .then((html) => {
                  res.set('Content-Type', 'text/html');
                  res.send(html);
                })
                .catch((transformErr) => next(transformErr));
            });
            return;
          }

          // Send the file relative to its folder, as `express.static` does.
          // Given an absolute path, `send` checks `dotfiles` against all of
          // its segments, so a root under `.output` would 404 here.
          const root = dirname(indexFilePath);
          res.sendFile(basename(indexFilePath), { root }, (err: Error) => {
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

      // The options object outlives this call: it is shared by every app
      // created from the same module, e.g. one per test. Prefixing it in place
      // would prepend the global prefix again on each of them.
      let serveRoot = options.serveRoot;
      if (
        globalPrefix &&
        options.useGlobalPrefix &&
        validateGlobalPrefix(globalPrefix)
      ) {
        serveRoot = `${normalizeGlobalPrefix(globalPrefix)}${serveRoot || ''}`;
      }

      this.serveFiles(
        httpAdapter,
        clientPath,
        serveRoot,
        options.serveStaticOptions
      );
      if (serveRoot) {
        const renderPath =
          typeof serveRoot === 'string'
            ? serveRoot + validatePath(options.renderPath as string)
            : serveRoot;

        app.get(renderPath, renderFn);
      } else {
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

  /**
   * Serves the files of `clientPath`, under `serveRoot` when given, with
   * `express.static`.
   */
  protected serveFiles(
    httpAdapter: AbstractHttpAdapter,
    clientPath: string,
    serveRoot: string | undefined,
    serveStaticOptions: ServeStaticModuleOptions['serveStaticOptions']
  ) {
    const app = httpAdapter.getInstance();
    const express = loadPackageSync('express', 'ServeStaticModule', () =>
      require('express')
    );
    if (serveRoot) {
      app.use(serveRoot, express.static(clientPath, serveStaticOptions));
    } else {
      app.use(express.static(clientPath, serveStaticOptions));
    }
  }
}
