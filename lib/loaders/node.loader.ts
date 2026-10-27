import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface.js';
import { ExpressLoader } from './express.loader.js';

/**
 * Loader for the Node adapter (`@nestjs/platform-node`). Its requests and
 * responses carry the Express API the Express loader uses (`res.sendFile()`,
 * error middleware), so only the files are served differently: by the
 * adapter itself, with `serve-static` (which is what `express.static` is),
 * so the `express` package is not needed.
 */
@Injectable()
export class NodeLoader extends ExpressLoader {
  protected serveFiles(
    httpAdapter: AbstractHttpAdapter,
    clientPath: string,
    serveRoot: string | undefined,
    serveStaticOptions: ServeStaticModuleOptions['serveStaticOptions']
  ) {
    httpAdapter.useStaticAssets(clientPath, {
      ...serveStaticOptions,
      prefix: serveRoot
    });
  }
}
