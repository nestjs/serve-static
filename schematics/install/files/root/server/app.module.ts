import { Module } from '@nestjs/common';
import { ServeStaticModuleModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModuleModule.forRoot({
      rootPath: '',
      viewsPath: join(process.cwd(), '<%= getBrowserDistDirectory() %>'),
      bundle: require('../server/main'),
       liveReload: true
    })
  ]
})
export class ApplicationModule {}
