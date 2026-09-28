import test from 'node:test';
import assert from 'node:assert/strict';
import {workspaceURL} from '../docs/create/launch.js';
test('accept an HTTPS app origin',()=>assert.equal(workspaceURL('https://uploads.example.test'), 'https://uploads.example.test/'));
test('unconfigured or unavailable inputs do not create launch links',()=>{for(const value of [null,undefined,'',123,'not a URL'])assert.equal(workspaceURL(value),null);});
test('reject a static demo, insecure local URL, or credential-bearing destination',()=>{
 for(const url of ['https://dsgn2002.github.io/sai-kung-3d-viewer/demo/index.html','https://dsgn2002.github.io/','http://127.0.0.1:8892/','https://localhost/','https://user:secret@uploads.example.test/','https://uploads.example.test/?invite=secret','https://uploads.example.test/#secret','https://uploads.example.test/demo/','javascript:alert(1)'])assert.equal(workspaceURL(url),null,url);
});
