/**
 * Vercel Serverless entry: all HTTP routes are rewritten here from vercel.json.
 * Requires `npm run build` (or `build:vercel`) so ../dist/vercel.js exists.
 */
import vercelHandler from '../dist/src/vercel.js';

export default vercelHandler;
