import os
root = os.path.join(os.getcwd(), "repository")
for dirpath, dirnames, filenames in os.walk(root):
    level = dirpath.replace(root, "").count(os.sep)
    indent = " " * 4 * level
    print(f'{indent}{os.path.basename(dirpath)}/')
    for f in filenames:
        print(f'{indent}    {f}')