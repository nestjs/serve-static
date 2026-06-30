import { Injectable } from '@nestjs/common';
import { AbstractHttpAdapter, ApplicationConfig } from '@nestjs/core';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface.js';
import { AbstractLoader } from './abstract.loader.js';

@Injectable()
export class NoopLoader extends AbstractLoader {
  public register(
    _httpAdapter: AbstractHttpAdapter,
    _config: ApplicationConfig,
    _options: ServeStaticModuleOptions[]
  ) {}
}
