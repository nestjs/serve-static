import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class ExpressLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    options: ServeStaticModuleOptions[]
  ) {
    const app = httpAdapter.getInstance();
    const express = loadPackage('express', 'ServeStaticModule', () =>
      require('express')
    );

    options.forEach(option => {
      const clientPath = option.rootPath;
      const indexFilePath = this.getIndexFilePath(clientPath);

      app.use(express.static(clientPath, option.serveStaticOptions));

      app.get(option.renderPath, (req: any, res: any) =>
        res.sendFile(indexFilePath)
      );
    });
  }
}
