import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Server } from 'net';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { NoopLogger } from '../utils/noop-logger';

describe('Express adapter', () => {
  let server: Server;
  let app: INestApplication;

  describe('when middleware throws generic error', () => {
    beforeAll(async () => {
      app = await NestFactory.create(AppModule.withDefaults(), {
        logger: new NoopLogger()
      });
      app.use((_req, _res, next) => next(new Error('Something went wrong')));

      server = app.getHttpServer();
      await app.init();
    });

    describe('GET /index.html', () => {
      it('should return Iternal Server Error', async () => {
        return request(server).get('/index.html').expect(500);
      });
    });
  });

  describe('when "fallthrough" option is set to "true"', () => {
    beforeAll(async () => {
      app = await NestFactory.create(AppModule.withFallthrough(), {
        logger: new NoopLogger()
      });
      app.setGlobalPrefix('api');

      server = app.getHttpServer();
      await app.init();
    });

    describe('GET /api', () => {
      it('should return "Hello, world!"', async () => {
        return request(server).get('/api').expect(200).expect('Hello, world!');
      });
    });

    describe('GET /', () => {
      it('should return HTML file', async () => {
        return request(server)
          .get('/')
          .expect(200)
          .expect('Content-Type', /html/);
      });
    });

    describe('GET /index.html', () => {
      it('should return index page', async () => {
        return request(server)
          .get('/index.html')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(/Static website/);
      });
    });

    describe('GET /logo.svg', () => {
      it('should return logo', async () => {
        return request(server)
          .get('/logo.svg')
          .expect(200)
          .expect('Content-Type', /image/);
      });
    });

    describe('when trying to get a non-existing file', () => {
      it('should return index page', async () => {
        return request(server)
          .get('/404')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(/Static website/);
      });
    });

    afterAll(async () => {
      await app.close();
    });
  });

  describe('when "fallthrough" option is set to "false"', () => {
    beforeAll(async () => {
      app = await NestFactory.create(AppModule.withoutFallthrough(), {
        logger: new NoopLogger()
      });
      app.setGlobalPrefix('api');

      server = app.getHttpServer();
      await app.init();
    });

    describe('GET /api', () => {
      it('should return "Hello, world!"', async () => {
        return request(server).get('/api').expect(200).expect('Hello, world!');
      });
    });

    describe('GET /', () => {
      it('should return HTML file', async () => {
        return request(server)
          .get('/')
          .expect(200)
          .expect('Content-Type', /html/);
      });
    });

    describe('GET /index.html', () => {
      it('should return index page', async () => {
        return request(server)
          .get('/index.html')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(/Static website/);
      });
    });

    describe('GET /logo.svg', () => {
      it('should return logo', async () => {
        return request(server)
          .get('/logo.svg')
          .expect(200)
          .expect('Content-Type', /image/);
      });
    });

    describe('when trying to get a non-existing file', () => {
      it('should return 404', async () => {
        return request(server)
          .get('/404')
          .expect(404)
          .expect(/Not Found/)
          .expect(/ENOENT/);
      });
    });

    describe('when trying to hit a non-existing route under the excluded path', () => {
      it('should return 404', async () => {
        return request(server)
          .get('/api/404')
          .expect(404)
          .expect(/Not Found/)
          .expect(/Cannot GET \/api\/404/);
      });
    });

    afterAll(async () => {
      await app.close();
    });
  });
});
