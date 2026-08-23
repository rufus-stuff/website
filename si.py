#!/usr/bin/env python3
# Static include 0.3 -- RufusRufus

import re                   # Importing regular expressions
import json                 # Importing json to read objects
import argparse             # We will need this to treat the script as a CLI
import time                 # For calculating the time a compile step took
import sys                  # Allows us to sys.exit and kill the process when needed
from pathlib import Path    # Python's modern path manager


#==== SETTINGS =============================================================
# Scanned folders
PUBLIC = Path("public")
PRIVATE = Path("private")
BUILD = Path("build")

# Templating elements
TAG_RE = re.compile(r'{{\s*(.+?)\s*}}')     # Capture template tags and their content
PATH_RE = re.compile(r'[\w./-]+')           # Verify a path has the expected symbols
VAR_RE = re.compile(r'{\s*(\w+|#)\s*}')     # Gets variables on smart templates
TERNARY_RE = re.compile(r'{\?(\d+)(.*?)##(.*?)\?}', re.DOTALL)  # Matches terniaries


#==== INNER COMPONENTS =====================================================
def parse_tag(tag_content):
    if '#' in tag_content:
        path, section = tag_content.split('#')
    else:
        path, section = tag_content, None

    if not PATH_RE.fullmatch(path):
        raise Exception(f'Invalid path on tag: {path}')
    
    return path, section

def expand_smart_tag(path, section):
    try:
        private_path = (PRIVATE/f"{path}.html").resolve()
        full_template = private_path.read_text()
    except Exception as e:
        sys.exit(f"Failed when attempting to access {private_path}")

    if '*---' not in full_template:
        raise Exception (f"Failed identifying smart template syntax on {private_path}")

    html_template, raw_data = full_template.split('*---', 1)
    html_template.strip('\n')

    try:
        data = json.loads(raw_data)
    except Exception as e:
        sys.exit(f"Failed parsing json block in {private_path}")

    items = data[section]
    if not isinstance(items, list):
        raise Exception(f"Section {section} is not a valid iterable smart template array")

    def resolve_conditionals(arr):
        def pick_branch(match):
            key = int(match.group(1))
            if key >= len(arr):
                sys.exit (f"Attempted to read a non-existent variable {key} in {private_path}")
            if arr[key] != '':
                return match.group(2).strip()
            return match.group(3).strip()

        output = []
        cursor = 0
        for match in TERNARY_RE.finditer(html_template):
            output.append(html_template[cursor:match.start()])
            output.append(pick_branch(match))
            cursor = match.end()
        output.append(html_template[cursor:])
        return "".join(output)


    def render_item(idx, arr):
        resolved_html = resolve_conditionals(arr)
        item_output = []
        cursor = 0

        for match in VAR_RE.finditer(resolved_html):
            item_output.append(resolved_html[cursor:match.start()])
            key = match.group(1)

            if key == '#':
                value = str(idx + 1)
            else:
                if key.isdigit() and int(key) < len(arr):
                    value = str(arr[int(key)])
                else:
                    raise Exception(f"Failed reading variables '{idx}:{key}' in {private_path}")

            item_output.append(value)
            cursor = match.end()

        item_output.append(resolved_html[cursor:])
        return ''.join(item_output)

    output = []
    for idx, arr in enumerate(items):
        output.append(render_item(idx, arr))

    return ''.join(output)

def expand_tag(path, section):
    if section:
        return expand_smart_tag(path, section)
    else:
        private_path = (PRIVATE/f"{path}.html").resolve()
        try:
            return private_path.read_text()
        except Exception as e:
            sys.exit(f"Failed when attempting to access {private_path}")



#==== MAIN COMMANDS ========================================================
def render_file(content:str) -> str:
    output = []
    cursor = 0

    for match in TAG_RE.finditer(content):
        output.append(content[cursor:match.start()])
        path, section = parse_tag(match.group(1))
        output.append(expand_tag(path, section))
        cursor = match.end()

    output.append(content[cursor:])
    return ''.join(output)

def web_build(args):

    if not PUBLIC.exists():
        sys.exit("public folder not found, nothing to compile.")
    if not PRIVATE.exists():
        sys.exit("private folder not found, nothing to compile.")

    start_time = time.time()
    print("Building static site...")
    verbose=args.verbose
    compile_count = 0
    copy_count = 0
    BUILD.mkdir(exist_ok=True)

    print("Compiling pages...")
    for page in PUBLIC.rglob("*.html"):
        in_path = page.relative_to(PUBLIC)
        out_path = BUILD / in_path
        out_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            output = render_file(page.read_text())
        except Exception as e:
            sys.exit(f'Build failed on {page}, {e}')

        out_path.write_text(output)
        compile_count += 1
        if verbose: 
            print(f"Compile: {in_path}")

    print("Linking assets...")
    for asset in PUBLIC.rglob("*"):
        if asset.is_file() and asset.suffix != '.html':
            in_path = asset.relative_to(PUBLIC)
            out_path = BUILD / in_path
            out_path.parent.mkdir(parents=True, exist_ok=True)

            if out_path.exists() or out_path.is_symlink():
                out_path.unlink()
    
            out_path.hardlink_to(asset.resolve())
    
            copy_count += 1
            if verbose: 
                print(f"Linked: {out_path}")


    end_time = time.time()
    timer = end_time - start_time
    if timer < 1:
        print(f"Compiled {compile_count} files and linked {copy_count} assets into build/ in {timer*1000:.1f}ms")
    else:
        print(f"Compiled {compile_count} files and linked {copy_count} assets into build/ in {timer:.2f}ms")

#==== CLI ==================================================================
def main():
    parser = argparse.ArgumentParser(description="Static web compiler for PRODUCT_NAME")
    sub = parser.add_subparsers(dest="command", required=True)
    sub_build = sub.add_parser("build", help="Compile static website into build/")
    sub_build.add_argument("-v", "--verbose", action="store_true", help="Log additional output into the terminal")
    sub_build.set_defaults(func=web_build)

    args = parser.parse_args()

    args.func(args)


if __name__ == "__main__":
    """Launches main if script is run directly, not imported"""
    main()
