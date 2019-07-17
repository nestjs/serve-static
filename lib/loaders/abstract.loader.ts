import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { join } from 'path';
import { AngularModuleOptions } from '../interfaces/angular-options.interface';

@Injectable()
export abstract class AbstractLoader {
  public abstract register(
    httpAdapter: AbstractHttpAdapter,
    options: AngularModuleOptions,
  );

  public getIndexFilePath(clientPath: string): string {
    return join(clientPath, 'index.html');
  }
}
