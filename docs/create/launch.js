// This public site only navigates to the private app; it never handles user media
// or invitation credentials. The private application and API share one origin.
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
async function loadWorkspace() {
  const link = document.getElementById('open-workspace');
  const status = document.getElementById('launch-status');
  try {
    const response = await fetch('../site-config.json', {cache:'no-store'});
    if (!response.ok) throw new Error('Configuration unavailable');
    const config = await response.json(), target = workspaceURL(config.uploadAppUrl);
    if (!target) return;
    link.href = target;
    link.hidden = false;
    status.textContent = 'Ready to create? Open your workspace and enter your invitation code.';
    document.getElementById('launch-help').textContent = 'Your media and saved projects stay in that workspace. You can return here to explore the sample demos.';
  } catch {
    status.textContent = 'We couldn’t load the workspace link. Try refreshing, or use the link supplied by your demo host. The sample journeys are still available below.';
  }
}
if (typeof document !== 'undefined') loadWorkspace();
