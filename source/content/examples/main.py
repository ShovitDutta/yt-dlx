import os
import shutil
def organize_ts_files(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(".ts"):
                old_filepath = os.path.join(dirpath, filename)
                file_name_without_ext = os.path.splitext(filename)[0]
                new_folder_path = os.path.join(dirpath, file_name_without_ext)
                os.makedirs(new_folder_path, exist_ok=True)
                new_ts_filepath = os.path.join(new_folder_path, "code.ts")
                new_js_filepath = os.path.join(new_folder_path, "code.js")
                new_mjs_filepath = os.path.join(new_folder_path, "code.mjs")
                shutil.move(old_filepath, new_ts_filepath)
                with open(new_js_filepath, "w") as f:
                    pass
                with open(new_mjs_filepath, "w") as f:
                    pass
if __name__ == "__main__":
    root_directory = "./"
    organize_ts_files(root_directory)