# My Travel Journey — Two sides of Hong Kong

[New world website](https://dsgn2002.github.io/sai-kung-3d-viewer/demo/world.html) ·
[Project website](https://dsgn2002.github.io/sai-kung-3d-viewer/) ·
[Coast and companions](https://dsgn2002.github.io/sai-kung-3d-viewer/demo/?scene=coast) ·
[City by tram](https://dsgn2002.github.io/sai-kung-3d-viewer/demo/?scene=city)

Static public demonstration. Generation scripts and viewer source are in
[MemGen](https://github.com/dsgn2002/MemGen/tree/main/journey-demo/nature_map).
Models run locally on DGX Spark. The browser uses precomputed compressed GLBs.
The create entry is a static walkthrough of the completed local-generation pipeline.

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

## Static hackathon demo — 2026-09-29

`/create/` is an open, precomputed Mid-Autumn walkthrough. It shows the saved local
Qwen pipeline and links to both existing generations, with no invitation form or
private backend dependency. The default view displays the saved design image directly, with wheel, button,
keyboard, and pinch zoom plus drag-to-pan, preserving its original brightness.
Original meshes remain available on white with neutral lighting; the animated tea house and lantern presets retain their atmosphere and
animation controls. The private upload service remains separate and authenticated.

The globe shows only journeys with generated scenes. Source publication dates
are retained in metadata but removed from the homepage. Sai Kung's boat follows
a complete 60-second circuit around the island with its three passengers.

Build and package the shared viewer following `../upload-app/README.md`. Only
approved demo outputs belong in `docs/create/assets/`; never copy a full private
workspace into the site.

### Review locally

```bash
python3 -m http.server 8790 --bind 127.0.0.1 --directory docs
PLAYWRIGHT_MODULE=/path/to/playwright SITE_URL=http://127.0.0.1:8790/ node tests/polish-smoke.cjs
```

The regression check covers desktop/mobile layouts, real journey listings, the
full boat circuit and pause control, both generated meshes on white, animated
preset switching, and static loading without API requests. GitHub Pages serves
`docs/`; no upload service needs to be configured for this demo.

The old loopback recording gateway is retained for private operator workflows.
It is no longer used by the public create page.

Design-view regression: `node tests/design-zoom-smoke.cjs` checks a 2560-pixel
display, phone pinch, zoom/pan/reset, zero initial GLB requests, and switching
between the saved image, original mesh, and animated presets.
