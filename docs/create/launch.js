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
async function loadWorkspace() {
  const link=document.getElementById('open-workspace'), status=document.getElementById('launch-status');
  const form=document.getElementById('invitation-form'), input=document.getElementById('invitation-code'), button=document.getElementById('sign-in');
  try {
    const response=await fetch('../site-config.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Configuration unavailable');
    const config=await response.json();
    if(localRecording(config,location.origin)){
      input.disabled=false;button.disabled=false;
      status.textContent='Enter your invitation to begin. Your saved projects will be waiting for you.';
      document.getElementById('launch-help').textContent='Your original media and personal results stay in your private workspace.';
      form.onsubmit=async event=>{
        event.preventDefault();button.disabled=true;input.disabled=true;status.textContent='Checking your invitation…';
        try {
          const login=await fetch(config.loginPath,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:input.value.trim()})});
          const data=await login.json();if(!login.ok)throw new Error(data.detail||'Unable to sign in.');
          input.value='';location.assign(config.uploadAppUrl);
        }catch(error){status.textContent=error.message;button.disabled=false;input.disabled=false;input.focus();}
      };
      return;
    }
    const target=workspaceURL(config.uploadAppUrl);
    if(!target){
      const recording=recordingFormURL(config.recordingLoginUrl);
      if(recording){
        form.action=recording;form.method='post';
        input.disabled=false;button.disabled=false;
        status.textContent='Enter your invitation code on the demo computer to open the private upload workspace.';
        document.getElementById('launch-help').textContent='This recording setup runs on the demo computer. Other devices need a separate workspace address.';
      }else{
        status.textContent='The upload workspace is not configured yet. Ask your demo host for its workspace link.';
      }
      return;
    }
    // Static public hosting cannot authenticate against a different origin.
    form.hidden=true;link.href=target;link.hidden=false;
    status.textContent='Open your secure workspace to enter your invitation code.';
    document.getElementById('launch-help').textContent='Your media and saved projects stay in that workspace.';
  }catch{
    status.textContent='We couldn’t load the workspace link. Try refreshing, or use the link supplied by your demo host.';
  }
}
if(typeof document!=='undefined')loadWorkspace();
