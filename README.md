# My Travel Journey — Two sides of Hong Kong

[Project website](https://dsgn2002.github.io/sai-kung-3d-viewer/) ·
[Coast and companions](https://dsgn2002.github.io/sai-kung-3d-viewer/demo/?scene=coast) ·
[City by tram](https://dsgn2002.github.io/sai-kung-3d-viewer/demo/?scene=city)

Static public demonstration. Generation scripts and viewer source are in
[MemGen](https://github.com/dsgn2002/MemGen/tree/main/journey-demo/nature_map).
Models run locally on DGX Spark. The browser uses precomputed compressed GLBs.
The personal-upload entry connects to the separately hosted MemGen application when its HTTPS address is configured; no upload backend runs on GitHub Pages.

The coast includes three distinct source-conditioned passengers parented to the
moving boat. Both scenes support daylight, golden sunset, and night lighting.
Source frames, scene plans, and limitations are available beside the scene.

The city sample adapts [Hong Kong Trams, September 2009](https://commons.wikimedia.org/wiki/File:Hong_Kong_Trams,_September_2009-UKNqZzl2cu8.webm)
by michaelinlondon, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
Frames are extracted and transformed into stylized assets; layout, illustrative
pedestrians, and alternate lighting are added. The coast source is
[The Travel Intern — Hong Kong Outdoor Adventure](https://www.youtube.com/watch?v=9jtnoejpLcU).
Source footage, models, and generated assets retain their respective rights.

GitHub Pages serves `/docs`. Start a local HTTP server to inspect the viewer;
opening the viewer directly as a file does not support module or mesh fetching.

## City refresh — 2026-09-27

Three sampled video moments now select different generated architecture: an office avenue (140.25 s), a rounded apartment corner (314.25 s), and older tram-side shops (404.50 s). Each has a silent source clip. The original generated tram is reused; city layout and pedestrians remain illustrative. Source/frame provenance is in `docs/demo/city-source.json`.

## Personal uploads: website entry and private workspace

The homepage now offers three experiences: the two existing public demos and
`/create/` for personal video/photo uploads. Both demo viewers link to the personal
flow. `/create/` explains upload → suggested moments/styles → saved approval →
generation, and opens the invitation-protected MemGen application as a top-level
page. Public static mode opens the private app for invitation login. Local recording
mode adds an invitation form validated through a loopback login gateway. The site
does not upload media, embed the private app, or make cross-origin API calls. Existing scene assets and generation code are unchanged.

### Required deployment setting

Set `docs/site-config.json` to the approved HTTPS **origin** of the upload app:

```json
{"uploadAppUrl":"https://your-approved-upload-host.example/"}
```

The `.example` value is illustrative; it is not a working service address.
The upload app must already be deployed there and its invitation login checked.
Keep invitation codes out of this file and repository. Use the upload service's
secure-cookie HTTPS configuration described in the
[MemGen upload guide](https://github.com/dsgn2002/MemGen/tree/main/upload-app).

**The public static setting remains `null`: online access is shown as being prepared.**
For a working local recording, use the recording server below; it supplies a
local configuration at runtime without publishing localhost links.
The existing `https://dsgn2002.github.io/sai-kung-3d-viewer/demo/index.html` URL
is the static sample viewer, not an upload backend. GitHub Pages does not host
the Python API/GPU worker. A local `127.0.0.1` address is not usable by teammates.
No public tunnel or upload service is created by this PR. Do not announce public
uploads as available until the real HTTPS origin has been configured and verified.
The launcher rejects non-HTTPS, credential-bearing/query/hash URLs, GitHub Pages
hosts and non-root paths to prevent an accidental loop back into the demos.

### Review locally

```bash
python3 -m http.server 8789 --bind 127.0.0.1 --directory docs
node --test tests/config.test.mjs
```

Open `http://127.0.0.1:8789/` and `/create/`. Serve through HTTP rather than opening
HTML as a file. The embed and links are relative, so repository subpaths and local
previews use the same scene files. The unconfigured view keeps both demos usable.

Browser smoke check (Playwright and Chrome supplied by your environment):

```bash
PLAYWRIGHT_MODULE=/path/to/playwright \
CHROME_PATH=/path/to/chrome \
SITE_URL=http://127.0.0.1:8789/ \
node tests/site-smoke.cjs
```

Verified at desktop (1280 px) and phone (390 px) widths: three experience cards,
new page navigation, unconfigured/configured/unavailable launcher states, both
3D demos loading geometry, and links from both viewers into the personal flow.
The configured-launch test uses an explicitly mocked HTTPS workspace; a real
public endpoint and end-to-end public upload remain to be configured and tested.


## Record a demo now — no new hosting provider

Use the existing Spark upload API/worker and SSH forward on port 8892. Run:

```bash
python3 scripts/recording_server.py --port 8897 --upload-port 8892
```

Open **http://127.0.0.1:8897/**. Choose **Create your own**, enter your existing
invitation code, and click **Enter workspace**. The invitation is checked against
the real Spark application. The browser then opens the authenticated workspace
at `http://127.0.0.1:8892/`, where saved trips and the normal upload → analysis →
review → generation flow are available. No second login is needed.

The recording server binds only to `127.0.0.1`. It serves the website and forwards
only `/demo-login` to the existing loopback upload service. It does not start
inference or create public tunnels. Codes are never stored or logged, and the
HTTP-only session cookie is preserved. Both ports deliberately use the same
loopback hostname so the cookie can reach the upload app. Use the upload app's
existing local-HTTP configuration (`TRIP_COOKIE_SECURE=0`); retain secure cookies
for any later HTTPS deployment. Keep the recording server and SSH forward running
while recording. The public HTTPS deployment can be configured separately later.

Validation: four configuration checks and three login-gateway tests pass. A real
invitation login in Chrome opens existing saved projects without a second login;
the desktop and phone layouts were inspected. No upload or inference job was
started during this check. This is a single-user recording setup, not a load test.

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
```
