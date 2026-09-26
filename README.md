# My Travel Journey — Two sides of Hong Kong

[Project website](https://dsgn2002.github.io/sai-kung-3d-viewer/) ·
[Coast and companions](https://dsgn2002.github.io/sai-kung-3d-viewer/demo/?scene=coast) ·
[City by tram](https://dsgn2002.github.io/sai-kung-3d-viewer/demo/?scene=city)

Static public demonstration. Generation scripts and viewer source are in
[MemGen](https://github.com/dsgn2002/MemGen/tree/main/journey-demo/nature_map).
Models run locally on DGX Spark. The browser uses precomputed compressed GLBs.
No video-upload backend is included in this demonstration.

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
