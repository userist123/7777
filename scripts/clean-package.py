import json, pathlib

pkg_path = pathlib.Path('/vercel/share/v0-project/package.json')
pkg = json.loads(pkg_path.read_text())

remove_deps = ['gsap', 'lenis', 'three', '@types/three', 'framer-motion', '@studio-freight/lenis']

changed = []
for key in remove_deps:
    if key in pkg.get('dependencies', {}):
        del pkg['dependencies'][key]
        changed.append(f"removed dep: {key}")
    if key in pkg.get('devDependencies', {}):
        del pkg['devDependencies'][key]
        changed.append(f"removed devDep: {key}")

pkg_path.write_text(json.dumps(pkg, indent=2) + '\n', encoding='utf-8')

if changed:
    for c in changed:
        print(c)
else:
    print("Nothing to remove — package.json already clean")
