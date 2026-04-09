import pathlib, json

root = pathlib.Path("/vercel/share/v0-project")
nm = root / "node_modules"

# Check if gsap and lenis are installed
for pkg in ["gsap", "lenis"]:
    pkg_json = nm / pkg / "package.json"
    if pkg_json.exists():
        data = json.loads(pkg_json.read_text())
        print(f"{pkg} INSTALLED: v{data.get('version', '?')}")
    else:
        print(f"{pkg} NOT INSTALLED - missing from node_modules")

# Check pnpm-lock.yaml
lock = root / "pnpm-lock.yaml"
if lock.exists():
    content = lock.read_text()
    for pkg in ["gsap", "lenis"]:
        if pkg in content:
            print(f"{pkg} found in pnpm-lock.yaml")
        else:
            print(f"{pkg} NOT in pnpm-lock.yaml")
else:
    print("pnpm-lock.yaml not found")
