/**
 * Normalizes a global prefix into a path segment that can be concatenated with
 * `serveRoot`: exactly one leading slash and no trailing one.
 *
 * `setGlobalPrefix` stores the prefix as given, so an application may have
 * passed either 'api' or '/api'. Assuming the former and prepending a slash
 * unconditionally turns the latter into a '//api' mount, which no request
 * matches.
 * @param {string} globalPrefix - The global prefix to normalize.
 * @returns {string} The prefix as a path segment, or an empty string if it
 * holds nothing but slashes.
 */
export const normalizeGlobalPrefix = (globalPrefix: string): string => {
  const trimmed = globalPrefix.replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed ? `/${trimmed}` : '';
};
