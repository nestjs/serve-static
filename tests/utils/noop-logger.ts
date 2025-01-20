import { ConsoleLogger } from '@nestjs/common';

export class NoopLogger extends ConsoleLogger {
  error(message: any, trace?: string, context?: string) {}
  warn(message: any, context?: string) {}
  log(message: any, context?: string) {}
  debug(message: any, context?: string) {}
  verbose(message: any, context?: string) {}
}
