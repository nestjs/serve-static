import { DynamicModule, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  ServeStaticModuleAsyncOptions,
  ServeStaticModuleOptions
} from './interfaces/serve-static-options.interface';
import { AbstractLoader } from './loaders/abstract.loader';
export declare class ServeStaticModule implements OnModuleInit {
  private readonly ngOptions;
  private readonly loader;
  private readonly httpAdapterHost;
  constructor(
    ngOptions: ServeStaticModuleOptions[],
    loader: AbstractLoader,
    httpAdapterHost: HttpAdapterHost
  );
  static forRoot(...options: ServeStaticModuleOptions[]): DynamicModule;
  static forRootAsync(options: ServeStaticModuleAsyncOptions): DynamicModule;
  private static createAsyncProviders;
  private static createAsyncOptionsProvider;
  onModuleInit(): Promise<void>;
}
