import os
import sys


if len(sys.argv) < 2:
    print(f"Please pass me a year! E.g.: `python {sys.argv[0]} 2022`")
    sys.exit()

YEAR = sys.argv[1]
new_lines = ["  - images:"]
new_lines = new_lines + [f"      - /images/{file_name}" for file_name in os.listdir("../.vuepress/public/images") if file_name.startswith(f"{YEAR}-")]
new_lines = new_lines + [f"    name: RoboCon {YEAR}"]

with open("README.md") as f:
    lines = f.readlines()

index = lines.index("galleries:\n") + 1
for l in new_lines:
    lines.insert(index, l + "\n")
    index += 1

with open("README.md", "w+") as f:
    f.writelines(lines)
