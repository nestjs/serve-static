import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { loadPackage } from '../utils/service-static.utils';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class ExpressLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    options: ServeStaticModuleOptions
  ) {
    const app = httpAdapter.getInstance();
    const express = loadPackage('express', 'ServeStaticModule', () =>
      require('express')
    );
    const clientPath = options.rootPath;
    const renderPath = options.rootPath;
    app.use(renderPath, express.static(clientPath, options.serveStaticOptions));
  }
}
