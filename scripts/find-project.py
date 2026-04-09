import os, subprocess

# Find where page.tsx actually exists
result = subprocess.run(
    ['find', '/', '-name', 'page.tsx', '-path', '*/app/page.tsx', '-not', '-path', '*/node_modules/*', '-not', '-path', '*/.next/*'],
    capture_output=True, text=True, timeout=15
)
print("Found page.tsx at:")
print(result.stdout)
print(result.stderr[:500] if result.stderr else "")

# Also check where the next dev server is running from
ps = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
next_procs = [l for l in ps.stdout.split('\n') if 'next' in l.lower()]
print("\nNext.js processes:")
for p in next_procs:
    print(p)
