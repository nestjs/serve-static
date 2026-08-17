import { pathToRegexp } from 'path-to-regexp';

export const isRouteExcluded = (req: any, paths: string[] | RegExp = []) => {
  const queryParamsIndex = req.originalUrl.indexOf('?');
  const pathname =
    queryParamsIndex >= 0
      ? req.originalUrl.slice(0, queryParamsIndex)
      : req.originalUrl;

  if (paths instanceof RegExp) {
    // The caller owns this RegExp and the same instance is reused for every
    // request, so `test` must not be used here: on a global or sticky pattern
    // it advances `lastIndex`, which would make consecutive requests for the
    // same path alternate between excluded and not. `search` always matches
    // from the start and leaves `lastIndex` untouched.
    return pathname.search(paths) !== -1;
  }

  return paths.some((path) => {
    const { regexp } = pathToRegexp(path);

    if (!regexp.exec(pathname + '/')) {
      return false;
    }

    return true;
  });
};
