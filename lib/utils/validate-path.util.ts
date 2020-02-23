export const validatePath = (path: string) =>
  path && path.charAt(0) !== '/' ? `/${path}` : path;
