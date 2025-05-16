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
        tor_path = find_bundled_file("context/windows/tor.exe")
        torrc_path = find_bundled_file("context/windows/torrc")
        ytprobe_path = find_bundled_file("context/windows/ytprobe.exe")
    else:
        tor_path = find_bundled_file("context/linux/tor.bin")
        torrc_path = find_bundled_file("context/linux/torrc")
        ytprobe_path = find_bundled_file("context/linux/ytprobe.bin")
    if args.tor is not None:
        tor_args = args.tor
        if torrc_path:
            tor_args = ["--config-file", torrc_path] + tor_args
        run_executable("tor", tor_path, tor_args)
    elif args.ytprobe is not None:
        run_executable("ytprobe", ytprobe_path, args.ytprobe)
    else:
        paths_info = {
            "tor": tor_path if tor_path else "Not found in bundle",
            "torrc": torrc_path if torrc_path else "Not found in bundle",
            "ytprobe": ytprobe_path if ytprobe_path else "Not found in bundle",
            "Running Python Executable": sys.executable
        }
        print(json.dumps(paths_info, indent=2))
if __name__ == "__main__":
    main()