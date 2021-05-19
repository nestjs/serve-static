import * as fs from 'fs';
import { validatePath } from '../utils/validate-path.util';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  NotFoundException
} from '@nestjs/common';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import { AbstractLoader } from '../loaders/abstract.loader';
import {
    DEFAULT_RENDER_PATH,
    DEFAULT_ROOT_PATH
  } from '../serve-static.constants';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { wildcardToRegExp } from '../utils/wilcard-to-reg-exp.util';

@Catch(NotFoundException)
export class NotFoundExceptionFilter extends BaseExceptionFilter {
  constructor(
    protected httpAdapterHost: HttpAdapterHost,
    private loader: AbstractLoader,
    private optionsArr: ServeStaticModuleOptions[]
  ) {
      super(httpAdapterHost.httpAdapter);
  }

  catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const opts = this.isRenderPath(request);

        if( opts === undefined ){
            return super.catch(exception, host);
        }

        opts.renderPath = opts.renderPath || DEFAULT_RENDER_PATH;
        const clientPath = opts.rootPath || DEFAULT_ROOT_PATH;
        const indexFilePath = this.loader.getIndexFilePath(clientPath);

        const stream = fs.createReadStream(indexFilePath);
        if (opts.serveStaticOptions && opts.serveStaticOptions.setHeaders) {
            const stat = fs.statSync(indexFilePath);
            opts.serveStaticOptions.setHeaders(response, indexFilePath, stat);
        }
        response.type('text/html').send(stream);
  }

  private isRenderPath(request): ServeStaticModuleOptions | undefined {
    return this.optionsArr.find( opts => {
        let renderPath: string | RegExp = opts.renderPath || DEFAULT_RENDER_PATH;

        if( opts.serveRoot ) {
            renderPath =
            typeof opts.serveRoot === 'string'
              ? opts.serveRoot + validatePath(renderPath as string)
              : opts.serveRoot;
        }

        const re = renderPath instanceof RegExp ? renderPath : wildcardToRegExp(renderPath);
        const queryParamsIndex = request.url.indexOf('?');
        const pathname =
          queryParamsIndex >= 0
            ? request.url.slice(0, queryParamsIndex)
            : request.url;
    
        return re.exec(pathname) ? true : false;
    });
  }
}
