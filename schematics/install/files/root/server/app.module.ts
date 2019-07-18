import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: '',
      viewsPath: join(process.cwd(), '<%= getBrowserDistDirectory() %>'),
      bundle: require('../server/main'),
      liveReload: true
    })
  ]
})
export class ApplicationModule {}
