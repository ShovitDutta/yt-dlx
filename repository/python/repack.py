# code 3: repack.py
import os
import sys
import shutil
import subprocess
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)
if sys.platform == "win32":
    command = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--name", "yt-dlx.exe",
        "--icon", "context/logo.jpg",
        "main.py",
        "--add-binary", f"context/windows/tor.exe;context/windows",
        "--add-binary", f"context/windows/ytprobe.exe;context/windows",
        "--add-data", f"context/windows/venv;context/windows/venv",
        "--add-data", f"logic.py;.",
        "--add-data", f"context/windows/torrc;context/windows"
    ]
    exe_name = "yt-dlx.exe"
elif sys.platform.startswith("linux"):
    command = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--name", "yt-dlx.bin",
        "--icon", "context/logo.jpg",
        "main.py",
        "--add-binary", f"context/linux/tor.bin:context/linux",
        "--add-binary", f"context/linux/ytprobe.bin:context/linux",
        "--add-data", f"context/linux/venv:context/linux/venv",
        "--add-data", f"logic.py:.",
        "--add-data", f"context/linux/torrc:context/linux"
    ]
    exe_name = "yt-dlx.bin"
else:
    sys.exit(1)
subprocess.run(command, check=True)
source_exe_path = os.path.join(script_dir, "dist", exe_name)
dest_exe_path = os.path.join(script_dir, exe_name)
if os.path.exists(source_exe_path):
    if os.path.exists(dest_exe_path):
        os.remove(dest_exe_path)
    shutil.move(source_exe_path, dest_exe_path)
spec_file = os.path.join(script_dir, f"{exe_name}.spec")
build_folder = os.path.join(script_dir, "build")
dist_folder = os.path.join(script_dir, "dist")
if os.path.exists(spec_file):
    os.remove(spec_file)
if os.path.exists(build_folder):
    shutil.rmtree(build_folder)
if os.path.exists(dist_folder):
    shutil.rmtree(dist_folder)