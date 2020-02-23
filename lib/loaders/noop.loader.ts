/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import { AbstractLoader } from './abstract.loader';

@Injectable()
export class NoopLoader extends AbstractLoader {
  public register(
    httpAdapter: AbstractHttpAdapter,
    options: ServeStaticModuleOptions[]
  ) {}
}
