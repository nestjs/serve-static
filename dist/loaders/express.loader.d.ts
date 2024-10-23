import { AbstractHttpAdapter } from '@nestjs/core';
import { ServeStaticModuleOptions } from '../interfaces/serve-static-options.interface';
import { AbstractLoader } from './abstract.loader';
export declare class ExpressLoader extends AbstractLoader {
  register(
    httpAdapter: AbstractHttpAdapter,
    optionsArr: ServeStaticModuleOptions[]
  ): void;
}
