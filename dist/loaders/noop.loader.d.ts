import { AbstractHttpAdapter } from '@nestjs/core';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import { AbstractLoader } from './abstract.loader';
export declare class NoopLoader extends AbstractLoader {
  register(
    httpAdapter: AbstractHttpAdapter,
    options: ServeStaticModuleOptions[]
  ): void;
}
