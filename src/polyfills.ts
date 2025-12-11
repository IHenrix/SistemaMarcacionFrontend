// Polyfill para librerías que esperan `process` en entornos browser
if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = { env: { NODE_ENV: 'production' }, browser: true };
} else if (typeof (globalThis as any).process.env === 'undefined') {
  (globalThis as any).process.env = { NODE_ENV: 'production' };
}
