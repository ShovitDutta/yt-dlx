# code 1: main.py
import os
import sys
import subprocess

def find_venv_python():
    if getattr(sys, "frozen", False):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    if sys.platform == "win32":
        venv_python_path = os.path.join(base_path, "context", "windows", "venv", "python.exe")
    else:
        venv_python_path = os.path.join(base_path, "context", "linux", "venv", "bin", "python")
    if os.path.exists(venv_python_path):
        return venv_python_path
    else:
        return None
if __name__ == "__main__":
    venv_python = find_venv_python()
    app_script_name = "logic.py"
    app_script_path = os.path.join(sys._MEIPASS if getattr(sys, "frozen", False) else os.path.dirname(os.path.abspath(__file__)), app_script_name)
    if venv_python and os.path.exists(app_script_path):
        command = [venv_python, app_script_path] + sys.argv[1:]
        try:
            result = subprocess.run(command, check=False) # check=True would raise CalledProcessError
            sys.exit(result.returncode) # Exit with the same code as logic.py
        except FileNotFoundError:
            print(f"Error: The bundled Python executable was not found at \"{venv_python}\" or the script \"{app_script_path}\" was not found.", file=sys.stderr)
            sys.exit(1)
        except PermissionError:
             print(f"Error: Permission denied to execute the bundled Python executable at \"{venv_python}\".", file=sys.stderr)
             sys.exit(1)
        except Exception as e:
            print(f"An unexpected error occurred while launching logic.py: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        if not venv_python:
            print("Error: Venv Python interpreter not found in the bundled environment.", file=sys.stderr)
            print(f"Expected to find it at: {os.path.join(sys._MEIPASS if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__)), 'context', 'windows', 'venv', 'python.exe')}", file=sys.stderr) # Provide the path it looked for
        if not os.path.exists(app_script_path):
            print(f"Error: Application logic script \"{app_script_path}\" not found in the bundled environment.", file=sys.stderr)
        sys.exit(1)