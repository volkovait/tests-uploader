/**
 * Vercel Serverless entry: all HTTP routes are rewritten here from vercel.json.
 * Requires `npm run build` so ../dist/src/vercel.js exists.
 * Explicit @nestjs import so Vercel's Nest detector accepts this project.
 */
import '@nestjs/core';
import vercelHandler from '../dist/src/vercel.js';

export default vercelHandler;
