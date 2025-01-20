import { pathToRegexp } from 'path-to-regexp';

export const isRouteExcluded = (req: any, paths: string[] = []) => {
  return paths.some((path) => {
    const { regexp } = pathToRegexp(path);
    const queryParamsIndex = req.originalUrl.indexOf('?');
    const pathname =
      queryParamsIndex >= 0
        ? req.originalUrl.slice(0, queryParamsIndex)
        : req.originalUrl;

    if (!regexp.exec(pathname + '/')) {
      return false;
    }
    return true;
  });
};
