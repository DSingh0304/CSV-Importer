export function log(level: 'info' | 'warn' | 'error', message: string, meta?: object) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (meta) {
    console.log(`${prefix} ${message}`, JSON.stringify(meta));
  } else {
    console.log(`${prefix} ${message}`);
  }
}
