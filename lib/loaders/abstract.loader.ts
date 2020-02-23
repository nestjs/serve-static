import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { join } from 'path';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';

@Injectable()
export abstract class AbstractLoader {
  public abstract register(
    httpAdapter: AbstractHttpAdapter,
    options: ServeStaticModuleOptions[]
  );

  public getIndexFilePath(clientPath: string): string {
    return join(clientPath, 'index.html');
  }
}
