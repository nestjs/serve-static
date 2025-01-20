/**
 * Validates a global prefix string. This will not allow string with only slashes.
 * @param {string} globalPrefix - The global prefix to validate.
 * @returns {boolean} Returns true if the prefix is valid, false otherwise.
 */
export const validateGlobalPrefix = (globalPrefix: string): boolean =>
  !globalPrefix.match(/^(\/?)$/);
