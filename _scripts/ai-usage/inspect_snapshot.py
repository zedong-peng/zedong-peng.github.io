"""Print a summary of a snapshot JSON file or of a fresh collection."""

import json
import subprocess
import sys

HERE = __import__("os").path.dirname(__import__("os").path.abspath(__file__))

if len(sys.argv) > 1:
    data = json.load(open(sys.argv[1], encoding="utf-8"))
else:
    out = subprocess.run([sys.executable, HERE + "/collect.py", "--json"],
                         stdout=subprocess.PIPE, check=True).stdout
    data = json.loads(out)

rows = data["rows"]
dates = sorted(row[0] for row in rows)
tokens = sum(sum(row[4:8]) for row in rows)
usd = sum(row[8] or 0 for row in rows)
print("rows", len(rows), "machines", data.get("machines"), "stale", data.get("stale_machines"))
for host in data.get("hosts") or []:
    print("  %-10s %14s tokens%s" % (host["name"], "{:,}".format(host["tokens"]), "  STALE" if host.get("stale") else ""))
for error in data.get("_errors") or data.get("errors") or []:
    print("  error:", error)
print("range", dates[0], "->", dates[-1])
print("total tokens", "{:,}".format(tokens), "list price", "$" + "{:,}".format(round(usd)))

by_tool = {}
by_day = {}
for row in rows:
    by_tool[row[1]] = by_tool.get(row[1], 0) + sum(row[4:8])
    by_day[row[0]] = by_day.get(row[0], 0) + sum(row[4:8])
for tool, value in sorted(by_tool.items(), key=lambda item: -item[1]):
    print("  %-12s %14s" % (tool, "{:,}".format(value)))
print("busiest days:")
for day, value in sorted(by_day.items(), key=lambda item: -item[1])[:5]:
    print("  %s %14s" % (day, "{:,}".format(value)))
