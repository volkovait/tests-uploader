'use strict';

/**
 * Vercel serverless entry. Uses CommonJS so TS never type-checks `../dist/…`
 * (that folder exists only after `npm run build` on CI / Vercel).
 */
const mod = require('../dist/vercel.js');

const inner = mod.default ?? mod;

// #region agent log
function agentLog(location, message, data, hypothesisId) {
  const payload = {
    sessionId: '6bce17',
    location,
    message,
    data: { ...data, hypothesisId },
    timestamp: Date.now(),
  };
  const line = JSON.stringify(payload);
  console.log('[agent-debug]', line);
  fetch('http://127.0.0.1:7447/ingest/3fc66898-37a1-4c91-80bb-cce8e3eaf704', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '6bce17',
    },
    body: line,
  }).catch(() => {});
}
agentLog('api/index.js:load', 'serverless module loaded', {}, 'H2');
// #endregion

module.exports = async function vercelHandler(req, res) {
  // #region agent log
  agentLog(
    'api/index.js:handler',
    'invoke',
    {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
    },
    'H1-H2',
  );
  // #endregion
  return inner(req, res);
};
