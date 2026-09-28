const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs');
const base=(process.env.SITE_URL||'http://127.0.0.1:8897/').replace(/\/?$/,'/');
const out=process.env.SCREENSHOT_DIR||'/tmp/memgen-site-review';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 if(await page.locator('.demo-cards .demo-card').count()!==3)throw Error('Expected three experience cards');
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});await page.goto(base);await page.screenshot({path:out+'/home-'+width+'.png',fullPage:true});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Homepage overflow');
  await page.locator('.personal-card').click();await page.waitForURL('**/create/');
  if(!await page.locator('#open-workspace').isHidden())throw Error('Unconfigured launcher must not navigate');
  await page.screenshot({path:out+'/create-'+width+'.png',fullPage:true});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Create page overflow');
 }
 // Simulate configuration only. No real user media or invitations are submitted.
 await page.route('**/site-config.json',r=>r.fulfill({json:{uploadAppUrl:'https://uploads.example.test/'}}));
 await page.reload();await page.locator('#open-workspace').waitFor({state:'visible'});
 if(await page.locator('#open-workspace').getAttribute('href')!=='https://uploads.example.test/')throw Error('Workspace URL mismatch');
 await page.route('https://uploads.example.test/',r=>r.fulfill({contentType:'text/html',body:'<h1>Test workspace</h1>'}));
 await page.locator('#open-workspace').click();await page.waitForURL('https://uploads.example.test/');
 await page.unroute('**/site-config.json');
 await page.route('**/site-config.json',r=>r.fulfill({status:503,body:'Unavailable'}));await page.goto(base+'create/');
 await page.waitForFunction(()=>document.querySelector('#launch-status').textContent.includes('couldn’t load'));
 if(!await page.locator('#open-workspace').isHidden())throw Error('Failed config must not expose a stale launch');
 for(const scene of ['coast','city']){
  await page.goto(base+'demo/?scene='+scene);
  await page.waitForFunction(()=>window.travelSceneState&&!window.travelSceneState().loading,null,{timeout:120000});
  const state=await page.evaluate(()=>window.travelSceneState());
  if(state.error||state.scene!==scene||!(state.triangles>0))throw Error(JSON.stringify(state));
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Demo overflow');
  await page.screenshot({path:out+'/demo-'+scene+'-390.png'});
  await page.locator('#create-link').click();await page.waitForURL('**/create/');
 }
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: three experiences, desktop/mobile, unset/configured/failed launch, both 3D demos and return navigation.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
