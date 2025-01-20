/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter, ApplicationConfig } from '@nestjs/core';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class NoopLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    config: ApplicationConfig,
    options: ServeStaticModuleOptions[]
  ) {}
}
