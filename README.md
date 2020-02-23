<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

`@nestjs/serve-static` package for [Nest](https://github.com/nestjs/nest), useful to serve static content like Single Page Applications (SPA). However, if you are building MVC application or want to serve assets files (images, docs), use the `useStaticAssets()` method (read more [here](https://docs.nestjs.com/techniques/mvc)) instead.

## Installation

```bash
$ npm i --save @nestjs/serve-static
```

## Example

See full example [here](https://github.com/nestjs/nest/tree/master/sample/24-serve-static).

## Usage

Simply import `ServeStaticModule` in your Nest application.

```typescript
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client')
    })
  ]
})
export class ApplicationModule {}
```

## API Spec

The `forRoot()` method takes an options object with a few useful properties.

| Property             | Type     | Description                                                                                                                                                                                                                |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rootPath`           | string   | Static files root directory. Default: "client/dist"                                                                                                                                                                        |
| `serveRoot`          | string   | Root path under which static app will be served. Default: ""                                                                                                                                                               |
| `renderPath`         | string   | Path to render static app (concatenated with the `serveRoot` value). Default: \* (wildcard - all paths)                                                                                                                    |
| `exclude`            | string[] | Paths to exclude when serving the static app. WARNING! Not supported by `fastify`. If you use `fastify`, you can exclude routes using regexp instead (e.g., to exclude `/api`, set the `renderPath` to `'/^(?!api)(.+)'`). |
| `serveStaticOptions` | Object   | Serve static options (static files)                                                                                                                                                                                        |

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

<<<<<<< HEAD
- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)
=======
* Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
* Website - [https://nestjs.com](https://nestjs.com/)
* Twitter - [@nestframework](https://twitter.com/nestframework)
>>>>>>> 8cae2484b1f5a6fc8b85f305d241f9289b65255a

## License

Nest is [MIT licensed](LICENSE).
