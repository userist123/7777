import shutil, os, pathlib

next_dir = pathlib.Path("/vercel/share/v0-project/.next")
if next_dir.exists():
    shutil.rmtree(next_dir)
    print(f"Deleted {next_dir}")
else:
    print(".next directory not found — already clean")
