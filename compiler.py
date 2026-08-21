#!/usr/bin/env python3

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

# Options
verbose = False

# Templating elements


#==== INNER COMPONENTS =====================================================


#==== MAIN COMMANDS ========================================================
def web_build(args):

    if not PUBLIC.exists():
        sys.exit("public folder not found, nothing to compile.")
    if not PRIVATE.exists():
        sys.exit("private folder not found, nothing to compile.")

    start_time = time.time()
    BUILD.mkdir(exist_ok=True)
    verbose=args.verbose
    compile_count = 0
    copy_count = 0

    for page in PUBLIC.rglob("*.html"):
        in_path = page.relative_to(PUBLIC)
        out_path = BUILD / in_path
        out_path.parent.mkdir(parents=True, exist_ok=True)

        out_path.write_text(page.read_text())

        compile_count += 1
        if verbose: 
            print(f"Compile: build/{in_path}")

    for asset in PUBLIC.rglob("*"):
        if asset.is_file() and asset.suffix != '.html':
            in_path = asset.relative_to(PUBLIC)
            out_path = BUILD / in_path
            out_path.parent.mkdir(parents=True, exist_ok=True)
    
            out_path.write_bytes(asset.read_bytes())
    
            copy_count += 1
            if verbose: 
                print(f"Write: build/{in_path}")


    end_time = time.time()
    timer = end_time - start_time
    if timer < 1:
        print(f"Compiled {compile_count} files and copied {copy_count} assets into build/ in {timer*1000:.1f}ms")
    else:
        print(f"Compiled {compile_count} files and copied {copy_count} assets into build/ in {timer:.2f}ms")

#==== CLI ==================================================================
def main():
    "Hi"
    parser = argparse.ArgumentParser(description="Static web compiler for PRODUCT_NAME")
    sub = parser.add_subparsers(dest="command", required=True)
    sub_build = sub.add_parser("build", help="Compile static website into build/")
    sub_build.add_argument("-f", "--full", action="store_true", help="Forces a full compile rather than only overwriting files that changed")
    sub_build.add_argument("-v", "--verbose", action="store_true", help="Log additional output into the terminal")
    sub_build.set_defaults(func=web_build)

    args = parser.parse_args()

    args.func(args)


if __name__ == "__main__":
    """Launches main if script is run directly, not imported"""
    main()
