import { regExpEscape } from "./reg-escape.util";

/**
 * Creates a RegExp from the given string, allowing wildcards.
 * 
 * "*" will be converted to ".*"
 * "?" will be converted to "."
 * 
 * Escapes the rest of the characters
 */
export const wildcardToRegExp = (s: string) => new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*').replace(/\\\?/g, '.') + '$');