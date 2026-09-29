// Public mode navigates to the private app. The loopback recording server also
// supports a same-origin invitation form; it never stores the code.
export function workspaceURL(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
    if (url.hostname.endsWith('.github.io') || url.hostname === 'github.io' || url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]') return null;
    // The current upload app is mounted at the origin root, not below /demo/.
    if (url.pathname !== '/') return null;
    return url.href;
  } catch { return null; }
}
export function localRecording(config, origin) {
  try {
    const site=new URL(origin), app=new URL(config.uploadAppUrl);
    return config.mode==='local-recording' && site.protocol==='http:' && site.hostname==='127.0.0.1'
      && app.protocol==='http:' && app.hostname==='127.0.0.1' && app.port!==site.port
      && app.pathname==='/' && !app.username && !app.password && !app.search && !app.hash
      && config.loginPath==='/demo-login';
  } catch { return false; }
}
export function recordingFormURL(value) {
  if (typeof value !== 'string') return null;
  try {
    const url=new URL(value);
    if (url.protocol!=='http:' || url.hostname!=='127.0.0.1' || url.pathname!=='/demo-login'
        || !url.port || url.username || url.password || url.search || url.hash) return null;
    return url.href;
  } catch { return null; }
}
