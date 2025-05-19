# code 3: repack.py
import os
import sys
import shutil
import subprocess
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)
command = [sys.executable, "-m", "PyInstaller", "--onefile", "--icon", "context/logo.jpg", "main.py", "--add-data", "logic.py:."]
if sys.platform == "win32":
    command.extend([
        "--name", "yt-dlx.exe",
        "--add-data", "context/windows/TorBrowser:context/windows/TorBrowser",
        "--add-binary", "context/windows/ytprobe.exe:context/windows/",
        "--add-binary", "context/windows/ffprobe.exe:context/windows/",
        "--add-binary", "context/windows/ffmpeg.exe:context/windows/",
        "--add-data", "context/windows/venv:context/windows/venv",
    ])
    exe_name = "yt-dlx.exe"
elif sys.platform.startswith("linux"):
    command.extend([
        "--name", "yt-dlx.bin",
        "--add-data", "context/linux/venv:context/linux/venv",
        "--add-binary", "context/linux/ffmpeg.bin:context/linux/",
        "--add-binary", "context/linux/ffprobe.bin:context/linux/",
        "--add-binary", "context/linux/ytprobe.bin:context/linux/",
        "--add-data", "context/linux/TorBrowser:context/linux/TorBrowser",
    ])
    exe_name = "yt-dlx.bin"
else:
    print(f"Unsupported platform: {sys.platform}", file=sys.stderr)
    sys.exit(1)
print("Running PyInstaller command:")
print(" ".join(command))
try:
    subprocess.run(command, check=True)
    source_exe_path = os.path.join(script_dir, "dist", exe_name)
    dest_exe_path = os.path.join(script_dir, exe_name)
    if os.path.exists(source_exe_path):
        if os.path.exists(dest_exe_path):
            os.remove(dest_exe_path)
        shutil.move(source_exe_path, dest_exe_path)
        print(f"Successfully created and moved {exe_name} to {dest_exe_path}")
    else:
        print(f"Error: Expected executable not found at {source_exe_path}", file=sys.stderr)
        sys.exit(1)
except subprocess.CalledProcessError as e:
    print(f"PyInstaller failed with exit code {e.returncode}", file=sys.stderr)
    sys.exit(e.returncode)
except Exception as e:
    print(f"An unexpected error occurred during repackaging: {e}", file=sys.stderr)
    sys.exit(1)
finally:
    spec_file = os.path.join(script_dir, f"{exe_name}.spec")
    build_folder = os.path.join(script_dir, "build")
    dist_folder_partial = os.path.join(script_dir, "dist")
    if os.path.exists(spec_file):
        print(f"Cleaning up {spec_file}")
        os.remove(spec_file)
    if os.path.exists(build_folder):
        print(f"Cleaning up {build_folder}")
        shutil.rmtree(build_folder)
    if os.path.exists(dist_folder_partial) and not os.listdir(dist_folder_partial):
        print(f"Cleaning up empty {dist_folder_partial}")
        shutil.rmtree(dist_folder_partial)