/**
 * Escapes all characters in the given string
 */
export const regExpEscape = (s: string) =>
  s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
