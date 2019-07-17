import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { loadPackage } from '../utils/service-static.utils';
import { AngularModuleOptions } from '../interfaces/angular-options.interface';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class ExpressLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    options: AngularModuleOptions,
  ) {
    const app = httpAdapter.getInstance();
    const express = loadPackage('express', 'AngularModule', () =>
      require('express'),
    );
    const clientPath = options.rootPath;
    const indexFilePath = this.getIndexFilePath(clientPath);

    app.use(express.static(clientPath, options.serveStaticOptions));
    app.get(options.renderPath, (req: any, res: any) =>
      res.sendFile(indexFilePath),
    );
  }
}
