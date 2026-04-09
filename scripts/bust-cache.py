import shutil, os

src = '/vercel/share/v0-project/app/page.tsx'
tmp = '/vercel/share/v0-project/app/_page_tmp.tsx'

# Read current content
with open(src, 'r') as f:
    content = f.read()

print("Current page.tsx content (first 5 lines):")
for line in content.split('\n')[:5]:
    print(repr(line))

# Write to a temp name then remove original, then write back
with open(tmp, 'w') as f:
    f.write(content)

os.remove(src)
print(f"Deleted {src}")

# Write back with fresh inode
with open(src, 'w') as f:
    f.write(content)

os.remove(tmp)
print(f"Re-created {src} with fresh inode")
print("Done.")
