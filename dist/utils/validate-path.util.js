"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePath = void 0;
const validatePath = (path) => path && path.charAt(0) !== '/' ? `/${path}` : path;
exports.validatePath = validatePath;
