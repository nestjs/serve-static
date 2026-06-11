import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '../../lib/index.js';
import { AppController } from './app.controller.js';

@Module({
  controllers: [AppController]
})
export class AppModule {
  static withDefaults() {
    return {
      module: AppModule,
      imports: [
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'client'),
          exclude: ['/api/{*any}']
        })
      ]
    };
  }

  static withFallthrough() {
    return {
      module: AppModule,
      imports: [
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'client'),
          exclude: ['/api/{*any}'],
          serveStaticOptions: {
            fallthrough: true
          }
        })
      ]
    };
  }

  static withoutFallthrough() {
    return {
      module: AppModule,
      imports: [
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'client'),
          exclude: ['/api/{*any}'],
          serveStaticOptions: {
            fallthrough: false
          }
        })
      ]
    };
  }
}
