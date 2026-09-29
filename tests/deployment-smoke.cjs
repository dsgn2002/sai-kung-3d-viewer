const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.SITE_URL||'http://127.0.0.1:8790/';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await page.goto(base+'demo/?scene=coast');await page.waitForFunction(()=>window.travelSceneState&&!travelSceneState().loading,null,{timeout:120000});
 const before=await page.evaluate(()=>travelSceneState());await page.waitForTimeout(500);const after=await page.evaluate(()=>travelSceneState());
 const dx=after.subjectPosition[0]-before.subjectPosition[0],dz=after.subjectPosition[2]-before.subjectPosition[2];
 assert(dx*Math.sin(after.subjectHeading)+dz*Math.cos(after.subjectHeading)>0,'Boat bow must face along the route');
 await page.goto(base);await page.waitForFunction(()=>window.worldState?.().ready,null,{timeout:120000});
 assert(await page.locator('#journeys').evaluate(e=>e.clientHeight<300));await page.screenshot({path:'/tmp/journey-polish/world-final.png'});
 // Exercise the repository subpath used by GitHub Pages while serving the real local files.
 await page.route('**/sai-kung-3d-viewer/**',async route=>{const response=await route.fetch({url:route.request().url().replace('/sai-kung-3d-viewer/','/')});await route.fulfill({response})});
 await page.goto(base+'sai-kung-3d-viewer/create/generation.html?moment=moment-03');
 await page.waitForFunction(()=>window.memgenViewer?.loaded==='moment-03',null,{timeout:120000});assert.equal(await page.evaluate(()=>memgenViewer.background),'ffffff');
 const download=await page.request.get(await page.locator('#download').getAttribute('href').then(h=>new URL(h,page.url()).href.replace('/sai-kung-3d-viewer/','/')));assert(download.ok());assert((await download.body()).subarray(0,4).toString()==='glTF');
 await page.locator('#representation').selectOption('refined');await page.locator('[data-id="moment-02"]').click();
 await page.waitForFunction(()=>window.memgenViewer?.loaded==='moment-02'&&memgenViewer.representation==='refined',null,{timeout:60000});assert.equal(await page.evaluate(()=>memgenViewer.characters.length),4);
 await page.locator('#back').click();await page.waitForURL('**/sai-kung-3d-viewer/create/');
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log('PASS: forward-facing boat, compact journeys, repository subpath, selected moment, GLB download, animated characters, and back navigation.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
