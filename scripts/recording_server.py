"""Loopback-only website preview plus invitation login for a single demo recording.

Run the existing SSH forward to the upload app first. This server does not start
inference, expose a public service, or store invitation codes.
"""
import argparse
import http.client
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

DOCS = Path(__file__).resolve().parents[1] / 'docs'

class RecordingHandler(SimpleHTTPRequestHandler):
    def __init__(self, request, client_address, server):
        super().__init__(request, client_address, server, directory=str(getattr(server, 'docs', DOCS)))

    def json_response(self, status, data, cookies=()):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        for cookie in cookies:
            self.send_header('Set-Cookie', cookie)
        self.end_headers()
        self.wfile.write(body)

    def expected_origin(self):
        return f'http://127.0.0.1:{self.server.server_port}'

    def valid_host(self):
        return self.headers.get('Host') == urlsplit(self.expected_origin()).netloc

    def do_GET(self):
        if not self.valid_host():
            return self.json_response(403, {'detail':'Open this preview using its 127.0.0.1 address.'})
        if urlsplit(self.path).path == '/site-config.json':
            return self.json_response(200, {'mode':'local-recording',
                'uploadAppUrl':f'http://127.0.0.1:{self.server.upload_port}/',
                'loginPath':'/demo-login'})
        return super().do_GET()

    def do_POST(self):
        if not self.valid_host() or self.headers.get('Origin') != self.expected_origin():
            return self.json_response(403, {'detail':'Sign in from the local website.'})
        if self.path != '/demo-login':
            return self.json_response(404, {'detail':'Not found.'})
        length = self.headers.get('Content-Length','')
        if self.headers.get('Transfer-Encoding') or not length.isdigit() or not 0 < int(length) <= 4096:
            return self.json_response(400, {'detail':'Invalid invitation request.'})
        try:
            data = json.loads(self.rfile.read(int(length)))
            code = data.get('code') if isinstance(data,dict) else None
            if not isinstance(code,str) or not 12 <= len(code.strip()) <= 160:
                raise ValueError()
        except (ValueError, TypeError):
            return self.json_response(400, {'detail':'Enter the invitation code supplied by your demo host.'})
        connection = http.client.HTTPConnection('127.0.0.1',self.server.upload_port,timeout=25)
        try:
            # Only login is forwarded. No code is put in a URL, log, or file.
            connection.request('POST','/api/login',body=json.dumps({'code':code.strip()}),
                               headers={'Content-Type':'application/json'})
            response = connection.getresponse()
            result = json.loads(response.read(65536))
            if response.status != 200:
                detail = result.get('detail','Unable to sign in.')
                return self.json_response(response.status, {'detail':detail if isinstance(detail,str) else 'Invalid invitation request.'})
            cookies = [v for k,v in response.getheaders() if k.lower()=='set-cookie']
            return self.json_response(200, {'ok':True}, cookies)
        except (OSError, ValueError, http.client.HTTPException):
            return self.json_response(502, {'detail':'The upload workspace is unreachable. Restore the Spark connection and try again.'})
        finally:
            connection.close()

    def log_message(self, format, *args):
        # Disable request logs entirely: invitation bodies and query strings are private.
        pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port',type=int,default=8897)
    parser.add_argument('--docs-dir',type=Path,default=DOCS)
    parser.add_argument('--upload-port',type=int,default=8892)
    args = parser.parse_args()
    if args.port == args.upload_port:
        parser.error('Website and upload ports must differ.')
    server = ThreadingHTTPServer(('127.0.0.1',args.port),RecordingHandler)
    server.upload_port = args.upload_port
    server.docs = args.docs_dir.resolve()
    print(f'Recording website: http://127.0.0.1:{server.server_port}/create/',flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
