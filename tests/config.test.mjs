import test from 'node:test';
import assert from 'node:assert/strict';
import {workspaceURL,recordingFormURL} from '../docs/create/launch.js';
test('accept an HTTPS app origin',()=>assert.equal(workspaceURL('https://uploads.example.test'), 'https://uploads.example.test/'));
test('unconfigured or unavailable inputs do not create launch links',()=>{for(const value of [null,undefined,'',123,'not a URL'])assert.equal(workspaceURL(value),null);});
test('reject a static demo, insecure local URL, or credential-bearing destination',()=>{
 for(const url of ['https://dsgn2002.github.io/sai-kung-3d-viewer/demo/index.html','https://dsgn2002.github.io/','http://127.0.0.1:8892/','https://localhost/','https://user:secret@uploads.example.test/','https://uploads.example.test/?invite=secret','https://uploads.example.test/#secret','https://uploads.example.test/demo/','javascript:alert(1)'])assert.equal(workspaceURL(url),null,url);
});
import {localRecording} from '../docs/create/launch.js';
test('local invitation login only enables on the recording server origin',()=>{
 const config={mode:'local-recording',uploadAppUrl:'http://127.0.0.1:8892/',loginPath:'/demo-login'};
 assert.equal(localRecording(config,'http://127.0.0.1:8897'),true);
 assert.equal(localRecording(config,'https://dsgn2002.github.io'),false);
 assert.equal(localRecording({...config,uploadAppUrl:'https://other.example/'},'http://127.0.0.1:8897'),false);
 assert.equal(localRecording({...config,loginPath:'https://other.example/'},'http://127.0.0.1:8897'),false);
});
test('public recording form accepts only the exact loopback login path',()=>{
 assert.equal(recordingFormURL('http://127.0.0.1:8898/demo-login'),'http://127.0.0.1:8898/demo-login');
 for(const url of ['https://other.example/demo-login','http://localhost:8898/demo-login','http://127.0.0.1:8898/','http://127.0.0.1:8898/demo-login?code=secret','http://user@127.0.0.1:8898/demo-login'])assert.equal(recordingFormURL(url),null,url);
});
