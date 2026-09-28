import http.client
import importlib.util
import json
from pathlib import Path
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
spec=importlib.util.spec_from_file_location('recording',Path(__file__).resolve().parents[1]/'scripts/recording_server.py')
recording=importlib.util.module_from_spec(spec);spec.loader.exec_module(recording)
class Backend(BaseHTTPRequestHandler):
    def do_POST(self):
        data=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        valid=data.get('code')=='test-invitation-code'
        self.send_response(200 if valid else 401)
        if valid:self.send_header('Set-Cookie','trip_session=test-session; HttpOnly; Path=/; SameSite=strict')
        self.end_headers();self.wfile.write(json.dumps({'csrf':'test-csrf'} if valid else {'detail':'Invitation code is invalid or expired.'}).encode())
    def log_message(self,*args):pass
class RecordingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.backend=ThreadingHTTPServer(('127.0.0.1',0),Backend)
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),recording.RecordingHandler)
        cls.server.upload_port=cls.backend.server_port
        for s in [cls.backend,cls.server]:threading.Thread(target=s.serve_forever,daemon=True).start()
    @classmethod
    def tearDownClass(cls):
        for s in [cls.server,cls.backend]:s.shutdown();s.server_close()
    def send(self,code,origin=None):
        conn=http.client.HTTPConnection('127.0.0.1',self.server.server_port)
        conn.request('POST','/demo-login',json.dumps({'code':code}),{'Content-Type':'application/json','Origin':origin or f'http://127.0.0.1:{self.server.server_port}'})
        r=conn.getresponse();result=(r.status,dict(r.getheaders()),json.loads(r.read()));conn.close();return result
    def test_login_forwards_http_only_session_but_not_code_or_csrf(self):
        status,headers,data=self.send('test-invitation-code')
        self.assertEqual(status,200);self.assertIn('HttpOnly',headers['Set-Cookie']);self.assertEqual(data,{'ok':True})
    def test_bad_invitation_is_not_a_fake_success(self):
        status,headers,data=self.send('incorrect-invitation')
        self.assertEqual(status,401);self.assertNotIn('Set-Cookie',headers);self.assertIn('invalid',data['detail'])
    def test_foreign_origin_cannot_submit(self):
        self.assertEqual(self.send('test-invitation-code','https://other.example')[0],403)
    def test_public_form_redirects_with_session_cookie(self):
        conn=http.client.HTTPConnection('127.0.0.1',self.server.server_port)
        conn.request('POST','/demo-login','code=test-invitation-code',
            {'Content-Type':'application/x-www-form-urlencoded','Origin':recording.PUBLIC_SITE_ORIGIN})
        response=conn.getresponse();headers=dict(response.getheaders());response.read();conn.close()
        self.assertEqual(response.status,303)
        self.assertEqual(headers['Location'],f'http://127.0.0.1:{self.backend.server_port}/')
        self.assertIn('HttpOnly',headers['Set-Cookie'])
    def test_public_form_rejects_wrong_origin(self):
        conn=http.client.HTTPConnection('127.0.0.1',self.server.server_port)
        conn.request('POST','/demo-login','code=test-invitation-code',
            {'Content-Type':'application/x-www-form-urlencoded','Origin':'https://other.example'})
        response=conn.getresponse();response.read();conn.close()
        self.assertEqual(response.status,403)
