import time
import subprocess


def monitor_and_commit():
    while True:
        try:
            status_check = subprocess.run(
                ["git", "status", "--porcelain"],
                capture_output=True,
                check=False,
                text=True,
            )
            if status_check.stdout.strip():
                print("Changes detected. Staging, Committing, and Pushing...")
                add_command = subprocess.run(
                    ["git", "add", "."], capture_output=True, text=True, check=True
                )
                commit_command = subprocess.run(
                    ["git", "commit", "-m", "yt-dlx (multi)"],
                    capture_output=True,
                    check=True,
                    text=True,
                )
                push_command = subprocess.run(
                    ["git", "push"], capture_output=True, text=True, check=True
                )
                print("Commit and push successful.")
            else:
                time.sleep(30)
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
