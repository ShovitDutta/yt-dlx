# code 2: logic.py
import os
import re
import sys
import json
import argparse
import subprocess

def find_bundled_file(relative_bundle_path):
    if getattr(sys, "frozen", False):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_path, relative_bundle_path.replace("/", os.sep))
    if not getattr(sys, "frozen", False) and not os.path.exists(file_path):
        alt_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", relative_bundle_path.replace("/", os.sep))
        if os.path.exists(alt_path):
            file_path = alt_path
        else:
            return None
    if os.path.exists(file_path):
        return file_path
    else:
        return None

def run_executable(executable_name_without_ext, executable_path, args):
    if not executable_path:
        print(f"Error: {executable_name_without_ext} not found in bundle.", file=sys.stderr)
        sys.exit(1)
    command = [executable_path] + args
    is_ytprobe = executable_name_without_ext == "ytprobe"
    try:
        if is_ytprobe:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=False
            )
            modified_stdout = re.sub(r"yt-dlp", "yt-dlx", result.stdout, flags=re.IGNORECASE)
            modified_stderr = re.sub(r"yt-dlp", "yt-dlx", result.stderr, flags=re.IGNORECASE)
            sys.stdout.write(modified_stdout)
            sys.stderr.write(modified_stderr)
            sys.exit(result.returncode)
        else:
            result = subprocess.run(
                command,
                stdout=None,
                stderr=None,
                check=False
            )
            sys.exit(result.returncode)
    except FileNotFoundError:
        print(f"Error: The executable \"{command[0]}\" was not found. Make sure the file \"{executable_path}\" exists in the bundle.", file=sys.stderr)
        sys.exit(127)
    except PermissionError:
        print(f"Error: Permission denied to execute \"{command[0]}\".", file=sys.stderr)
        sys.exit(126)
    except subprocess.SubprocessError as e:
        print(f"Error running command \"{' '.join(command)}\": {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred while running \"{' '.join(command)}\": {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="yt-dlx: YouTube downloader utility with bundled executables")
    parser.add_argument("--tor", nargs=argparse.REMAINDER, help="Run tor with the arguments...")
    parser.add_argument("--ytprobe", nargs=argparse.REMAINDER, help="Run ytprobe with the arguments...")
    args = parser.parse_args()

    if sys.platform == "win32":
        tor_path = find_bundled_file("context/windows/TorBrowser/tor/tor.exe")
        tor_data_dir = find_bundled_file("context/windows/TorBrowser/data")
        ytprobe_path = find_bundled_file("context/windows/ytprobe.exe")
    else:
        tor_path = find_bundled_file("context/linux/TorBrowser/tor/tor")
        tor_data_dir = find_bundled_file("context/linux/TorBrowser/data")
        ytprobe_path = find_bundled_file("context/linux/ytprobe.bin")

    if args.tor is not None:
        if not tor_path:
            print("Error: Bundled Tor executable not found in expected location.", file=sys.stderr)
            sys.exit(1)
        if not tor_data_dir:
            print("Error: Bundled Tor Data directory not found in expected location.", file=sys.stderr)
            sys.exit(1)
        tor_subprocess_args = []
        tor_subprocess_args.extend(["--DataDirectory", tor_data_dir])
        bundled_torrc_filename = "torrc"
        bundled_torrc_full_path = os.path.join(tor_data_dir, bundled_torrc_filename)
        if os.path.exists(bundled_torrc_full_path):
            tor_subprocess_args.extend(["--config-file", bundled_torrc_full_path])
        else:
            print(f"Warning: Bundled torrc not found at expected location: {bundled_torrc_full_path}", file=sys.stderr)
        tor_subprocess_args.extend(args.tor)
        run_executable("tor", tor_path, tor_subprocess_args)
    elif args.ytprobe is not None:
        run_executable("ytprobe", ytprobe_path, args.ytprobe)
    else:
        paths_info = {
            "tor_executable": tor_path if tor_path else "Not found in bundle",
            "tor_data_directory": tor_data_dir if tor_data_dir else "Not found in bundle",
            "ytprobe": ytprobe_path if ytprobe_path else "Not found in bundle",
            "bundled_torrc_win": find_bundled_file("context/windows/TorBrowser/data/torrc") if sys.platform == "win32" else "N/A on this platform",
            "bundled_torrc_linux": find_bundled_file("context/linux/TorBrowser/data/torrc") if sys.platform != "win32" else "N/A on this platform",
            "Running Python Executable": sys.executable
        }
        print(json.dumps(paths_info, indent=2))

if __name__ == "__main__":
    main()