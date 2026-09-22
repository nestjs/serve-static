import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module.js';
import { NoopLogger } from '../utils/noop-logger.js';
import request from 'supertest';

describe('Fastify adapter', () => {
  let app: NestFastifyApplication;

  describe('when "fallthrough" option is set to "true"', () => {
    beforeAll(async () => {
      app = await NestFactory.create(
        AppModule.withFallthrough(),
        new FastifyAdapter(),
        {
          logger: new NoopLogger()
        }
      );
      app.setGlobalPrefix('api');

      await app.init();
      await app.getHttpAdapter().getInstance().ready();
    });

    describe('GET /api', () => {
      it('should return "Hello, world!"', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/api'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.payload).toEqual('Hello, world!');
          });
      });
    });

    describe('GET /', () => {
      it('should return HTML file', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.headers['content-type']).toMatch(/html/);
            expect(result.payload).toContain('Static website');
          });
      });
    });

    describe('GET /index.html', () => {
      it('should return index page', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/index.html'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.payload).toContain('Static website');
          });
      });
    });

    describe('GET /logo.svg', () => {
      it('should return logo', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/logo.svg'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.headers['content-type']).toMatch(/image/);
          });
      });
    });

    describe('when trying to get a non-existing file', () => {
      it('should returns index page', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/404'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.payload).toContain('Static website');
          });
      });
    });

    afterAll(async () => {
      await app.close();
    });
  });

  describe('when "fallthrough" option is set to "false"', () => {
    beforeAll(async () => {
      app = await NestFactory.create(
        AppModule.withoutFallthrough(),
        new FastifyAdapter(),
        {
          logger: new NoopLogger()
        }
      );
      app.setGlobalPrefix('api');

      await app.init();
      await app.getHttpAdapter().getInstance().ready();
    });

    describe('GET /api', () => {
      it('should return "Hello, world!"', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/api'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.payload).toEqual('Hello, world!');
          });
      });
    });

    describe('GET /', () => {
      it('should return HTML file', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.headers['content-type']).toMatch(/html/);
            expect(result.payload).toContain('Static website');
          });
      });
    });

    describe('GET /index.html', () => {
      it('should return index page', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/index.html'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.payload).toContain('Static website');
          });
      });
    });

    describe('GET /logo.svg', () => {
      it('should return logo', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/logo.svg'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.headers['content-type']).toMatch(/image/);
          });
      });
    });

    describe('when trying to get a non-existing file', () => {
      it('should return 404', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/404'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(404);
          });
      });
    });

    afterAll(async () => {
      await app.close();
    });
  });

  describe('when "transformIndexHtml" is set', () => {
    beforeAll(async () => {
      app = await NestFactory.create(
        AppModule.withTransformIndexHtml(),
        new FastifyAdapter(),
        {
          logger: new NoopLogger()
        }
      );
      app.setGlobalPrefix('api');

      await app.init();
      await app.getHttpAdapter().getInstance().ready();
    });

    describe('GET /some/spa/route', () => {
      it('should return the transformed index.html', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/some/spa/route'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.headers['content-type']).toMatch(/html/);
            expect(result.payload).toContain('<h1>Static website</h1>');
            expect(result.payload).toContain('<!--/some/spa/route-->');
          });
      });
    });

    describe('GET /logo.svg', () => {
      it('should still return the untransformed static asset', async () => {
        return app
          .inject({
            method: 'GET',
            url: '/logo.svg'
          })
          .then((result) => {
            expect(result.statusCode).toEqual(200);
            expect(result.headers['content-type']).toMatch(/image/);
          });
      });
    });

    afterAll(async () => {
      await app.close();
    });
  });

  describe('when "transformIndexHtml" returns a Promise', () => {
    beforeAll(async () => {
      app = await NestFactory.create(
        AppModule.withAsyncTransformIndexHtml(),
        new FastifyAdapter(),
        {
          logger: new NoopLogger()
        }
      );
      app.setGlobalPrefix('api');

      await app.init();
      await app.getHttpAdapter().getInstance().ready();
    });

    it('should await the transform before responding', async () => {
      return app
        .inject({
          method: 'GET',
          url: '/some/other/route'
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);
          expect(result.payload).toContain('Async website');
        });
    });

    afterAll(async () => {
      await app.close();
    });
  });
});
