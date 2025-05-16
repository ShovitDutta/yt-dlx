# code 3: repack.py - CORRECTED SOURCE PATHS FOR BOTH WINDOWS AND LINUX TOR
import os
import sys
import shutil
import subprocess

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

separator = ";" if sys.platform == "win32" else ":"

command = [
    sys.executable, "-m", "PyInstaller",
    "--onefile",
    "--icon", "context/logo.jpg",
    "main.py",
    f"--add-data", f"logic.py{separator}.",
]

if sys.platform == "win32":
    command.extend([
        "--name", "yt-dlx.exe",
        # CORRECTED Windows tor.exe source path based on listing
        "--add-binary", f"context/windows/TorBrowser/Browser/TorBrowser/Tor/tor.exe{separator}context/windows",
        # ytprobe source path seems correct based on your image
        "--add-binary", f"context/windows/ytprobe.exe{separator}context/windows",
        "--add-data", f"context/windows/venv{separator}context/windows/venv",
    ])
    exe_name = "yt-dlx.exe"
elif sys.platform.startswith("linux"):
    command.extend([
        "--name", "yt-dlx.bin",
        # CORRECTED Linux tor.bin source path based on listing
        "--add-binary", f"context/linux/TorBrowser/Browser/TorBrowser/Tor/tor{separator}context/linux",
        # ytprobe source path seems correct based on your image
        "--add-binary", f"context/linux/ytprobe.bin{separator}context/linux",
        "--add-data", f"context/linux/venv{separator}context/linux/venv",
    ])
    exe_name = "yt-dlx.bin"
else:
    print(f"Unsupported platform: {sys.platform}", file=sys.stderr)
    sys.exit(1)

# Add both torrc files
command.extend([
    # CORRECTED Windows torrc source path based on listing
    f"--add-data", f"context/windows/TorBrowser/Browser/TorBrowser/Data/Tor/torrc{separator}context/windows",
    # CORRECTED Linux torrc source path based on listing
    f"--add-data", f"context/linux/TorBrowser/Browser/TorBrowser/Data/Tor/torrc{separator}context/linux",
])

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