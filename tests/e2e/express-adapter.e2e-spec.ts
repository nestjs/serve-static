import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Server } from 'net';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { NoopLogger } from '../utils/noop-logger.js';

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

  describe('when sendFile fails after the response has started', () => {
    let callbackError: Error | undefined;
    let sendFileCalled: boolean;
    let destroyed: boolean;

    // `sendFile` reports failures through its error callback, but by then the
    // response is already on the wire. Standing in for that keeps the test
    // deterministic: a real mid-stream disconnect is a race.
    //
    // In production the callback runs inside a `setImmediate`, so anything it
    // throws escapes the middleware chain and takes down the process. Here it
    // is captured so the test can assert nothing was thrown at all.
    const createApp = async (failure: Error) => {
      callbackError = undefined;
      sendFileCalled = false;
      destroyed = false;

      app = await NestFactory.create(AppModule.withDefaults(), {
        logger: new NoopLogger()
      });

      app.use((_req: any, res: any, next: Function) => {
        res.sendFile = (
          _path: string,
          _options: unknown,
          callback: Function
        ) => {
          sendFileCalled = true;
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write('<!doctype html>');

          const realDestroy = res.destroy.bind(res);
          res.destroy = (...args: unknown[]) => {
            destroyed = true;
            return realDestroy(...args);
          };

          try {
            callback(failure);
          } catch (error) {
            callbackError = error as Error;
          }
          if (!destroyed && !res.writableEnded) {
            res.end();
          }
        };
        next();
      });

      server = app.getHttpServer();
      await app.init();
    };

    afterEach(async () => {
      await app.close();
    });

    // An unknown path is what reaches the SPA fallback; "/" is served straight
    // from disk by express.static and never calls sendFile. Both cases assert
    // `sendFileCalled` so they fail loudly rather than passing vacuously if the
    // request ever stops reaching the fallback.
    describe('GET /some/spa/route', () => {
      it('should not try to respond again once the headers are sent', async () => {
        await createApp(
          Object.assign(new Error('Request aborted'), { code: 'ECONNABORTED' })
        );

        await request(server)
          .get('/some/spa/route')
          .catch(() => undefined);

        expect(sendFileCalled).toBe(true);
        expect(callbackError).toBeUndefined();
      });

      it('should tear the connection down when the file fails mid-stream', async () => {
        // Not an abort: the socket is alive, but `send` has already committed a
        // Content-Length the truncated body cannot satisfy, so the client hangs
        // unless the response is destroyed.
        await createApp(
          Object.assign(new Error('EIO: read failed'), { code: 'EIO' })
        );

        await request(server)
          .get('/some/spa/route')
          .catch(() => undefined);

        expect(sendFileCalled).toBe(true);
        expect(callbackError).toBeUndefined();
        expect(destroyed).toBe(true);
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

  describe('when exclude is a RegExp', () => {
    beforeAll(async () => {
      app = await NestFactory.create(AppModule.withRegexExclude(), {
        logger: new NoopLogger()
      });

      server = app.getHttpServer();
      await app.init();
    });

    describe('GET /api', () => {
      it('should return 404 for excluded route', async () => {
        return request(server)
          .get('/api')
          .expect(404)
          .expect(/Not Found/);
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
