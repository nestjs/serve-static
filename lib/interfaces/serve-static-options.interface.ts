import { Provider, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

/**
 * @publicApi
 */
export interface ServeStaticModuleOptions {
  /**
   * Static files root directory. Default: "client"
   */
  rootPath?: string;
  /**
   * Path to render static app (concatenated with the `serveRoot` value).
   * Default (express): {*any} (wildcard - all paths).
   * Default (fastify): * (wildcard - all paths).
   */
  renderPath?: string | RegExp;
  /**
   * If `true`, static app will be prefixed by the global prefix set through `setGlobalPrefix()`.
   * Default: `false`.
   * @see https://docs.nestjs.com/faq/global-prefix
   */
  useGlobalPrefix?: boolean;
  /**
   * Root path under which static app will be served. Default: ""
   */
  serveRoot?: string;
  /**
   * Paths to exclude when serving the static app. WARNING! Not supported by `fastify`. If you use `fastify`, you can exclude routes using regexp (set the `renderPath` to a regular expression) instead.
   */
  exclude?: string[];
  /**
   * Serve static options (static files)
   * Passed down to the underlying either `express.static` or `fastify-static.send`
   */
  serveStaticOptions?: {
    /**
     * Enable or disable setting Cache-Control response header, defaults to true.
     * Disabling this will ignore the immutable and maxAge options.
     */
    cacheControl?: boolean;

    /**
     * Set how "dotfiles" are treated when encountered. A dotfile is a file or directory that begins with a dot (".").
     * Note this check is done on the path itself without checking if the path actually exists on the disk.
     * If root is specified, only the dotfiles above the root are checked
     * (i.e. the root itself can be within a dotfile when when set to "deny").
     * The default value is 'ignore'.
     * 'allow' No special treatment for dotfiles
     * 'deny' Send a 403 for any request for a dotfile
     * 'ignore' Pretend like the dotfile does not exist and call next()
     */
    dotfiles?: string;

    /**
     * Enable or disable etag generation, defaults to true.
     */
    etag?: boolean;

    /**
     * Enable or disable client setting errors fall-through as unhandled requests, defaults to true, otherwise forward a client error.
     */
    fallthrough?: boolean;

    /**
     * Set file extension fallbacks. When set, if a file is not found, the given extensions
     * will be added to the file name and search for.
     * The first that exists will be served. Example: ['html', 'htm'].
     * The default value is false.
     */
    extensions?: string[];

    /**
     * Enable or disable the immutable directive in the Cache-Control response header.
     * If enabled, the maxAge option should also be specified to enable caching.
     * The immutable directive will prevent supported clients from making conditional
     * requests during the life of the maxAge option to check if the file has changed.
     */
    immutable?: boolean;

    /**
     * By default this module will send "index.html" files in response to a request on a directory.
     * To disable this set false or to supply a new index pass a string or an array in preferred order.
     */
    index?: boolean | string | string[];

    /**
     * Enable or disable Last-Modified header, defaults to true. Uses the file system's last modified value.
     */
    lastModified?: boolean;

    /**
     * Provide a max-age in milliseconds for http caching, defaults to 0.
     * This can also be a string accepted by the ms module.
     */
    maxAge?: number | string;

    /**
     * Redirect to trailing "/" when the pathname is a dir. Defaults to true.
     */
    redirect?: boolean;

    /**
     * Function to set custom headers on response. Alterations to the headers need to occur synchronously.
     * The function is called as fn(res, path, stat), where the arguments are:
     * res the response object
     * path the file path that is being sent
     * stat the stat object of the file that is being sent
     */
    setHeaders?: (res: any, path: string, stat: any) => any;

    /**
     * Only for Fastify.
     *
     * When enabled, the server will attempt to send the Brotli encoded asset first,
     * if supported by the Accept-Encoding headers. If Brotli is not supported,
     * it will retry with gzip, and finally fall back to the original file.
     *
     * You may choose to skip compression for smaller files that do not benefit from it.
     */
    preCompressed?: boolean;

    /**
     * Only for Fastify.
     *
     * When false, reply object won't be automatically decorated with the sendFile method.
     * @default true
     */
    decorateReply?: boolean;
  };
}

/**
 * @publicApi
 */
export interface ServeStaticModuleOptionsFactory {
  createLoggerOptions():
    | Promise<ServeStaticModuleOptions[]>
    | ServeStaticModuleOptions[];
}

/**
 * @publicApi
 */
export interface ServeStaticModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  useExisting?: Type<ServeStaticModuleOptionsFactory>;
  useClass?: Type<ServeStaticModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<ServeStaticModuleOptions[]> | ServeStaticModuleOptions[];
  inject?: any[];
  extraProviders?: Provider[];
}
