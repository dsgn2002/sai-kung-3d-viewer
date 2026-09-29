const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.SITE_URL||'http://127.0.0.1:8790/';
const out=process.env.SCREENSHOT_DIR||'/tmp/journey-polish';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});await page.goto(base);
  await page.waitForFunction(()=>window.worldState?.().ready,null,{timeout:120000});
  assert.equal(await page.locator('.j-item').count(),2);
  assert.equal(await page.locator('.pin-sample').count(),0);
  assert(!await page.locator('#world').innerText().then(t=>/source video|sample places|2009|2018/.test(t)));
  if(width<1000)await page.locator('#journeys summary').click();
  await page.locator('.j-item[data-trip="coast"]').click();await page.waitForTimeout(1600);
  assert(await page.locator('#card-open').isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:out+'/world-'+width+'.png'});
  await page.locator('#world-create').click();await page.waitForURL('**/create/');
  assert.equal(await page.locator('input[type=password],#invitation-form').count(),0);
  assert(await page.locator('#pipeline').isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:out+'/create-'+width+'.png',fullPage:true});
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'demo/?scene=coast');await page.waitForFunction(()=>window.travelSceneState&&!window.travelSceneState().loading,null,{timeout:120000});
 let s=await page.evaluate(()=>travelSceneState());assert.equal(s.error,null);assert.equal(s.passengerCount,3);assert(s.attachedToBoat);
 // Accelerate elapsed time through the browser clock to inspect all four route quadrants.
 let positions=[];
 for(let i=0;i<4;i++){await page.waitForTimeout(16000);s=await page.evaluate(()=>travelSceneState());positions.push(s.subjectPosition);console.log(JSON.stringify({routeTime:s.time,position:s.subjectPosition}));assert(Math.abs(Math.hypot(s.subjectPosition[0],s.subjectPosition[2])-11.5)<.001);}
 assert(positions.some(p=>p[0]>0)&&positions.some(p=>p[0]<0)&&positions.some(p=>p[2]>0)&&positions.some(p=>p[2]<0));
 await page.locator('#motion').click();const paused=(await page.evaluate(()=>travelSceneState())).time;await page.waitForTimeout(500);assert.equal((await page.evaluate(()=>travelSceneState())).time,paused);
 await page.locator('#focus').click();await page.screenshot({path:out+'/boat.png'});

 if(!process.env.SKIP_GENERATIONS){
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto(base+'create/generation.html');await page.waitForFunction(()=>window.memgenViewer?.representation==='design',null,{timeout:120000});
  await page.locator('#representation').selectOption('original');await page.waitForFunction(()=>window.memgenViewer?.vertices>0);
  for(const id of ['moment-02','moment-03']){
   await page.locator(`#moments [data-id="${id}"]`).click();
   await page.waitForFunction(id=>window.memgenViewer?.loaded===id&&window.memgenViewer.representation==='original',id,{timeout:60000});
   s=await page.evaluate(()=>memgenViewer);assert(s.texturedMeshes>0);assert.equal(s.background,'ffffff');assert.equal(s.floorVisible,false);
   assert(await page.locator('#lighting').isHidden());
   await page.screenshot({path:out+'/'+id+'-mesh.png'});
   await page.locator('#representation').selectOption('refined');await page.waitForFunction(()=>memgenViewer.representation==='refined',null,{timeout:60000});
   s=await page.evaluate(()=>memgenViewer);assert(s.floorVisible);if(id==='moment-02')assert.equal(s.characters.length,4);else assert.equal(s.lanterns,10);
   await page.locator('#lighting').selectOption('sunset');await page.screenshot({path:out+'/'+id+'-animated.png'});
   await page.locator('#animation').uncheck();const t=await page.evaluate(()=>memgenViewer.animationTime);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>memgenViewer.animationTime),t);
   await page.locator('#representation').selectOption('original');await page.waitForFunction(()=>memgenViewer.representation==='original');
  }
  assert(!requests.some(u=>u.includes('/api/')||u.includes('8892')));
  await page.setViewportSize({width:390,height:844});await page.locator('#reset').click();await page.waitForTimeout(500);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:out+'/mesh-mobile.png',fullPage:true});
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,boatPositions:positions,errors}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
