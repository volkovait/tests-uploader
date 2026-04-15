'use strict';

/**
 * Vercel serverless entry. Uses CommonJS so TS never type-checks `../dist/…`
 * (that folder exists only after `npm run build` on CI / Vercel).
 */
const mod = require('../dist/vercel.js');

module.exports = mod.default ?? mod;
