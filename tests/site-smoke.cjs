const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs');
const base=(process.env.SITE_URL||'http://127.0.0.1:8898/').replace(/\/?$/,'/');
const out=process.env.SCREENSHOT_DIR||'/tmp/memgen-site-review';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});
  await page.goto(base);await page.waitForURL('**/demo/world.html');
  await page.waitForFunction(()=>window.worldState?.().ready,{},{timeout:120000});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Globe overflow');
  await page.screenshot({path:out+'/world-'+width+'.png',fullPage:true});
  await page.locator('#world-create').click();await page.waitForURL('**/create/');
  if(await page.locator('nav a').count()!==2)throw Error('Create navigation must contain World and Create only');
  if(await page.locator('.samples').count())throw Error('Old sample tabs are still visible');
  if(await page.locator('#invitation-form').count())throw Error('Static demo must not require an invitation');
  await page.locator('#pipeline').waitFor();
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Create page overflow');
  await page.screenshot({path:out+'/create-'+width+'.png',fullPage:true});
 }
 for(const scene of ['coast','city']){
  await page.goto(base+'demo/?scene='+scene);
  await page.waitForFunction(()=>window.travelSceneState&&!window.travelSceneState().loading,null,{timeout:120000});
  const state=await page.evaluate(()=>window.travelSceneState());
  if(state.error||state.scene!==scene||!(state.triangles>0))throw Error(JSON.stringify(state));
  if(await page.locator('#coast-link, #city-link').count())throw Error('Old scene tabs are still visible');
  await page.locator('#create-link').click();await page.waitForURL('**/create/');
 }
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: globe entrance, invitation-free static pipeline, compact navigation, both 3D scenes.');
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exit(1)});
