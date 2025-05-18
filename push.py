import time
import subprocess
def monitor_and_commit():
    while True:
        try:
            status_check = subprocess.run(["git", "status", "--porcelain"], capture_output=True,check=False,text=True,)
            if status_check.stdout.strip():
                print("Changes detected. Staging, Committing, and Pushing...")
                add_command = subprocess.run(["git", "add", "."], capture_output=True, text=True, check=True)
                print(add_command.stdout)
                print(add_command.stderr)
                commit_command = subprocess.run(["git", "commit", "-m", "♥ yt-dlx ♥"],capture_output=True,check=True,text=True,)
                print(commit_command.stdout)
                print(commit_command.stderr)
                push_command = subprocess.run(["git", "push"], capture_output=True, text=True, check=True)
                print(push_command.stdout)
                print(push_command.stderr)
                print("Commit and push successful.")
            else:
                time.sleep(10)
        except subprocess.CalledProcessError as e:
            print(f"Git command failed: {e}")
            print(f"Stdout: {e.stdout}")
            print(f"Stderr: {e.stderr}")
        except Exception as e:
            print(f"An error occurred: {e}")
            time.sleep(10)
if __name__ == "__main__":
    print("Starting Git repository monitor...")
    monitor_and_commit()