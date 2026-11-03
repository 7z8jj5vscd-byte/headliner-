"""Bump the game's build so players see the update banner.

Usage: python3 nashville/tools/bump_version.py "Short title" "Note one" "Note two" ...
Updates BUILD in update.js, version.json, and the ?v= cache-busting tags in index.html.
"""
import datetime, json, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
today = datetime.date.today().strftime('%Y.%m.%d')
cur = json.load(open(os.path.join(root, 'version.json')))['build']
n = int(cur.split('-')[1]) + 1 if cur.startswith(today) else 1
build = f'{today}-{n}'
title, notes = (sys.argv[1] if len(sys.argv) > 1 else ''), sys.argv[2:]
json.dump({'build': build, 'title': title, 'notes': notes}, open(os.path.join(root, 'version.json'), 'w'))
p = os.path.join(root, 'update.js'); s = open(p).read()
open(p, 'w').write(re.sub(r"const BUILD='[^']*';", f"const BUILD='{build}';", s))
p = os.path.join(root, 'index.html'); s = open(p).read()
open(p, 'w').write(re.sub(r'\.js\?v=[0-9.\-]+"', f'.js?v={build}"', s))
print(build)
