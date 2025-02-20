import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { NoopLogger } from '../utils/noop-logger';
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
});
