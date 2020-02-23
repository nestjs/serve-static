import * as pathToRegexp from 'path-to-regexp';

export const isRouteExcluded = (req: any, paths: string[] = []) => {
  return paths.some(path => {
    const re = pathToRegexp(path);
    const queryParamsIndex = req.originalUrl.indexOf('?');
    const pathname =
      queryParamsIndex >= 0
        ? req.originalUrl.slice(0, queryParamsIndex)
        : req.originalUrl;

    if (!re.exec(pathname + '/')) {
      return false;
    }
    return true;
  });
};
