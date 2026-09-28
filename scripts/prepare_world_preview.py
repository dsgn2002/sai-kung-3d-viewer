"""Combine the merged MemGen UI with this site's assets and invitation flow.

This only prepares a local recording preview. It does not change public demos.
"""
import argparse
from pathlib import Path
import shutil
import subprocess

SITE=Path(__file__).resolve().parents[1]

def prepare(memgen, ref, output):
    output=output.resolve()
    if output == SITE/'docs' or output.is_relative_to(SITE/'docs'):
        raise ValueError('Use a separate preview output directory.')
    revision=subprocess.check_output(['git','-C',str(memgen),'rev-parse',ref],text=True).strip()
    prefix='journey-demo/nature_map/web/'
    files=subprocess.check_output(['git','-C',str(memgen),'ls-tree','-r','--name-only',revision,prefix],text=True).splitlines()
    if prefix+'world.html' not in files:
        raise ValueError('This ref does not contain the merged world UI.')
    output.mkdir(parents=True,exist_ok=True)
    shutil.copytree(SITE/'docs',output,dirs_exist_ok=True)
    for file in files:
        target=output/'demo'/file[len(prefix):]
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(subprocess.check_output(['git','-C',str(memgen),'show',revision+':'+file]))
    world=output/'demo/world.html'
    s=world.read_text()
    marker='<p id="w-stats" class="w-stats"></p>'
    if marker not in s:raise ValueError('World header changed; review the preview integration.')
    s=s.replace(marker,marker+'\n    <a id="world-create" class="create-scene" href="../create/">+ Create your own scene</a>')
    s=s.replace('<button id="card-add" class="btn-quiet" disabled>Add photos to build this scene</button>', '<a id="card-add" class="btn-quiet" href="../create/">Create a scene with your media ↗</a>')
    world.write_text(s)
    with (output/'demo/world.css').open('a') as f:
        f.write('\n.create-scene{display:inline-flex;align-items:center;min-height:44px;margin-top:16px;padding:10px 18px;background:var(--amber);color:var(--deep);border-radius:999px;text-decoration:none;font-weight:600;box-shadow:var(--shadow)}.create-scene:hover{background:#ffd184}#card-add{text-decoration:none}\n')
    scene=output/'demo/index.html'
    s=scene.read_text().replace('<div class="topbar-tools">','<div class="topbar-tools"><a id="scene-create" class="tool create-scene-link" href="../create/" aria-label="Create your own scene">+ Create</a>')
    scene.write_text(s)
    with (output/'demo/viewer.css').open('a') as f:f.write('\n.create-scene-link{text-decoration:none;white-space:nowrap}\n')
    create=output/'create/index.html'
    s=create.read_text()
    if 'href="../demo/world.html"' not in s:
        s=s.replace('<nav aria-label="Experiences">','<nav aria-label="Experiences"><a href="../demo/world.html">World</a>')
    create.write_text(s)
    (output/'preview-revision.txt').write_text(revision+'\n')
    return revision

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--memgen',type=Path,required=True)
    parser.add_argument('--ref',default='origin/main')
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    print('Prepared world + personal upload preview:',prepare(args.memgen,args.ref,args.output))
