"""Collect AI token usage from every configured machine and write one snapshot.

Each machine names one or more backends. Every backend returns the same row
shape, so adding a machine or a backend is a config line, not new code.

Backends
  python   pipes ai_tokens.py to python3 on the machine (over ssh, or locally).
           Standard library only, nothing is installed remotely; reads Claude
           Code, Codex, OpenCode logs and the Cursor account. Works on any host
           with Python 3.8+.
  ccusage  runs `npx ccusage daily --json --by-agent` locally or over ssh and
           maps its per-agent output. Needs Node 18+; use `tools` to keep it
           from overlapping with the python backend on the same machine (both
           read the same logs).

Config: ~/.config/ai-usage/config.json (see config.example.json).

  collect.py                 collect, write the snapshot, keep history
  collect.py --publish       also commit and push the snapshot to the blog repo
  collect.py add-host NAME [--ssh HOST] [--backend TYPE] [--tools a,b]
  collect.py add-backend NAME --type TYPE [--tools a,b]
  collect.py status          show what each machine would contribute

Merge rules
  Same machine:  per day, tool and model keep the larger count, so a backend
                 that misses a log does not shrink the day, and a second
                 backend reading the same logs does not double it.
  Across machines: summed.
  History:       ~/.local/state/ai-usage/hosts/<machine>-<backend>.json, because
                 Claude Code drops logs after ~30 days.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.expanduser("~/.config/ai-usage/config.json")
STATE = os.path.expanduser("~/.local/state/ai-usage")
TZ = timezone(timedelta(hours=8))
FIELDS = ["date", "tool", "model", "requests", "input", "cache_read", "cache_write", "output", "api_usd"]

# ccusage agent ids -> the tool names the page already knows.
CCUSAGE_TOOLS = {
    "claude": "claude-code", "claude-code": "claude-code", "codex": "codex",
    "opencode": "opencode", "cursor": "cursor", "gemini": "gemini",
    "copilot": "copilot", "qwen": "qwen", "kimi": "kimi", "amp": "amp",
    "pi": "pi", "grok": "grok", "goose": "goose", "droid": "droid",
    "kilo": "kilo", "zcode": "zcode", "openclaw": "openclaw",
}


def write_json(path, data, **options):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path + ".tmp", "w", encoding="utf-8") as handle:
        json.dump(data, handle, **options)
    os.replace(path + ".tmp", path)


def read_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return default


def load_config(path=CONFIG):
    config = read_json(path)
    if config is None:
        sys.exit("No config at %s; start from config.example.json." % path)
    for host in config["hosts"]:
        host.setdefault("backends", [{"type": "python"}])
        if not isinstance(host["backends"], list) or not host["backends"]:
            sys.exit("%s: backends must be a non-empty list" % host["name"])
        for backend in host["backends"]:
            if backend.get("type") not in ("python", "ccusage"):
                sys.exit("%s: unknown backend %r" % (host["name"], backend.get("type")))
    return config


def save_config(config, path=CONFIG):
    write_json(path, config, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------- backends

def backend_python(host, backend, timeout):
    """Pipe the collector to the machine; stdout is one JSON snapshot."""
    with open(os.path.join(HERE, "ai_tokens.py"), "rb") as handle:
        script = handle.read()
    command = ["python3", "-", "--host", host["name"]]
    tools = backend.get("tools")
    if tools:
        command += ["--tools", ",".join(tools)]
    if host.get("ssh"):
        command = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", host["ssh"]] + command
    result = subprocess.run(command, input=script, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, timeout=timeout)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.decode(errors="replace").strip()[-300:])
    snapshot = json.loads(result.stdout)
    return snapshot.get("rows") or [], snapshot.get("errors") or []


def ccusage_argv(backend):
    version = backend.get("version")
    package = "ccusage@%s" % version if version else "ccusage"
    return ["npx", "-y", package, "daily", "--json", "--by-agent", "-z", "Asia/Shanghai"]


def backend_ccusage(host, backend, timeout):
    shell = " ".join(shquote(part) for part in ccusage_argv(backend))
    if host.get("ssh"):
        # A login shell so nvm-installed node/npx is on PATH; everything after
        # `--` is quoted for the remote shell.
        command = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", host["ssh"],
                   "bash", "-lc", shell]
    else:
        # launchd starts with a bare PATH, so node/npx would not be found.
        command = ["bash", "-lc", shell]
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.decode(errors="replace").strip()[-300:])
    return ccusage_rows(json.loads(result.stdout))


def shquote(value):
    return "'" + value.replace("'", "'\"'\"'") + "'"


MODEL_PREFIX = re.compile(r"^\[[^\]]+\]\s*")


def ccusage_rows(payload):
    """ccusage daily --by-agent -> [date, tool, model, requests, in, read, write, out, cost]."""
    rows = []
    for day in payload.get("daily") or []:
        period = day.get("period")
        agents = day.get("agents") or [{"agent": day.get("agent") or "all",
                                        "modelBreakdowns": day.get("modelBreakdowns") or []}]
        for agent in agents:
            tool = CCUSAGE_TOOLS.get(str(agent.get("agent", "")).lower(), str(agent.get("agent") or "unknown"))
            for breakdown in agent.get("modelBreakdowns") or []:
                model = MODEL_PREFIX.sub("", str(breakdown.get("modelName") or "unknown")).strip().lower()
                tokens = [int(breakdown.get(key) or 0) for key in
                          ("inputTokens", "cacheReadTokens", "cacheCreationTokens", "outputTokens")]
                if not any(tokens):
                    continue
                cost = breakdown.get("cost")
                rows.append([period, tool, model, 0] + tokens +
                            [round(cost, 6) if isinstance(cost, (int, float)) and cost > 0 else None])
    return rows, []


BACKENDS = {"python": backend_python, "ccusage": backend_ccusage}


# ---------------------------------------------------------------- merging

def host_rows(host, backend, rows):
    """Merge one backend into the machine's history; past days only shrink when logs are pruned."""
    path = os.path.join(STATE, "hosts", "%s-%s.json" % (host["name"], backend.get("type", "python")))
    history = read_json(path, {"rows": {}})
    stored = history["rows"]
    for day, tool, model, requests, fresh, read, write, output, cost in rows:
        key = "|".join((str(day), tool, model))
        value = [int(v or 0) for v in (requests, fresh, read, write, output)]
        old = stored.get(key)
        # Same machine, second backend: keep whichever saw more of that day.
        if old is None or sum(value[1:]) >= sum(old[1:5]):
            stored[key] = value + [cost]
    history["rows"] = stored
    history["updated_at"] = datetime.now(TZ).isoformat(timespec="seconds")
    write_json(path, history)
    return stored


def legacy_path(name):
    return os.path.join(STATE, "hosts", "%s-legacy.json" % name)


def legacy_rows(name):
    """Seeded history for one machine: {day|tool|model: [requests, in, read, write, out, cost]}."""
    return (read_json(legacy_path(name)) or {}).get("rows") or {}


def collect_host(host, timeout):
    per_tool = {}
    errors = []
    stale = False
    sources = [dict(backend) for backend in host["backends"]]
    # Seeded history (an older collector, or a machine since removed) answers
    # every run: it keeps days whose logs are long gone.
    legacy = legacy_rows(host["name"])
    if legacy:
        sources.append({"type": "legacy"})
    for backend in sources:
        name = backend.get("type", "python")
        if name == "legacy":
            rows = [[key.split("|", 2)[0], key.split("|", 2)[1], key.split("|", 2)[2]] + list(value)
                    for key, value in legacy.items()]
        else:
            try:
                rows = list(BACKENDS[name](host, backend, timeout)[0])
            except Exception as error:  # one backend must not hide the others
                stale = True
                errors.append("%s: %s" % (name, error))
                continue
        allowed = backend.get("tools")
        if allowed:
            rows = [row for row in rows if row[1] in allowed]
        for key, value in host_rows(host, backend, rows).items():
            old = per_tool.get(key)
            # Two sources may see the same day (seeded history vs a live read):
            # keep the larger count instead of summing or letting one win by order.
            if old is None or sum(value[1:5]) > sum(old[1:5]):
                per_tool[key] = value
    return {"name": host["name"], "rows": per_tool, "errors": errors, "stale": stale}


def api_cost(prices, aliases, model, value):
    price = prices.get(aliases.get(model, model))
    if price is None:
        return value[5]
    return sum(tokens * rate for tokens, rate in zip(value[1:5], price)) / 1e6


def build(config, timeout):
    hosts = config["hosts"]
    with ThreadPoolExecutor(max(len(hosts), 1)) as pool:
        pending = [pool.submit(collect_host, host, timeout) for host in hosts]
    results = []
    for host, future in zip(hosts, pending):
        try:
            results.append(future.result())
        except Exception as error:  # unreachable machine: keep what history has
            results.append({"name": host["name"], "rows": {}, "errors": [str(error)], "stale": True})

    table = read_json(os.path.join(HERE, "prices.json"), {})
    prices = {key: value for key, value in table.items() if not key.startswith("_")}
    aliases = {key: value for key, value in (table.get("_aliases") or {}).items() if not key.startswith("_")}

    combined = {}
    machines = []
    errors = []
    for result in results:
        tokens = 0
        for key, value in result["rows"].items():
            combined[key] = value if key not in combined else [a + b for a, b in zip(
                combined[key][:5], value[:5])] + [None]
            tokens += sum(value[1:5])
        machines.append({"name": result["name"], "tokens": tokens, "stale": result["stale"]})
        # Diagnostic text can carry local paths; it stays out of the published file.
        errors.extend("%s: %s" % (result["name"], error) for error in result["errors"])

    rows = []
    for key, value in sorted(combined.items()):
        day, tool, model = key.split("|", 2)
        if not sum(value[1:5]):
            continue
        cleaned = model_name(model)
        rows.append([day, tool, cleaned] + value[:5] + [api_cost(prices, aliases, cleaned, value)])

    now = datetime.now(TZ)
    return {
        "schema_version": 1,
        "updated_at": now.isoformat(timespec="seconds"),
        "timezone": "Asia/Shanghai",
        "columns": FIELDS,
        "rows": rows,
        "machines": len(results),
        "stale_machines": sum(1 for result in results if result["stale"]),
        "hosts": [{key: machine[key] for key in ("name", "tokens", "stale")} for machine in machines],
        # Errors are returned to the caller for the log, never written to disk.
        "_errors": errors,
    }


def model_name(raw):
    """Drop relay prefixes and routing suffixes: openai/gpt-5 -> gpt-5."""
    name = str(raw).strip().lower().rsplit("/", 1)[-1]
    return re.sub(r"-cc-format$", "", name) or "unknown"


# ---------------------------------------------------------------- publish

def public(snapshot):
    """Drop private fields (leading underscore) before anything reaches disk or stdout."""
    return {key: value for key, value in snapshot.items() if not key.startswith("_")}


def publish(config, snapshot):
    output = os.path.expanduser(config["output"])
    old = read_json(output)
    snapshot = public(snapshot)
    write_json(output, snapshot, ensure_ascii=False, separators=(",", ":"))
    changed = old is None or old.get("rows") != snapshot["rows"] or old.get("updated_at") != snapshot["updated_at"]
    if not changed:
        print("No change; %s left alone." % output)
        return
    repo = os.path.expanduser(config.get("repo") or os.path.dirname(output))
    relative = os.path.relpath(output, repo)
    stamp = snapshot["updated_at"][:10]
    status = subprocess.run(["git", "-C", repo, "status", "--porcelain", "--", relative],
                            stdout=subprocess.PIPE, text=True)
    if not status.stdout.strip():
        print("Nothing staged for %s." % relative)
        return
    subprocess.run(["git", "-C", repo, "add", "--", relative], check=True)
    subprocess.run(["git", "-C", repo, "commit", "-q", "-m",
                    "data: AI usage snapshot %s (%d rows, %d machines)" % (stamp, len(snapshot["rows"]), snapshot["machines"])],
                   check=True)
    subprocess.run(["git", "-C", repo, "push", "-q"], check=True)
    print("Published %s to %s." % (relative, repo))


# ---------------------------------------------------------------- config commands

def add_host(args):
    config = load_config()
    if any(host["name"] == args.name for host in config["hosts"]):
        sys.exit("%s is already configured" % args.name)
    backend = {"type": args.backend}
    if args.tools:
        backend["tools"] = [tool.strip() for tool in args.tools.split(",") if tool.strip()]
    host = {"name": args.name, "backends": [backend]}
    if args.ssh:
        host["ssh"] = args.ssh
    config["hosts"].append(host)
    save_config(config)
    print("Added %s (%s%s)." % (args.name, args.backend, ", ssh " + args.ssh if args.ssh else ", local"))


def seed(args):
    """Import history from the older collector (~/.local/state/ai-tokens).

    Per-machine files keep their attribution; rows in the merged tokens.json
    that no machine file covers are added to the machine they came from when
    that is knowable, otherwise dropped with a count. Values are max-merged, so
    running this twice is safe.
    """
    source = os.path.expanduser(args.source)
    aliases = {"fpga-tailscale": "fpga"}
    imported = 0
    for name in sorted(os.listdir(os.path.join(source, "hosts"))):
        if not name.endswith(".json") or ".bak" in name:
            continue
        machine = aliases.get(name[:-5], name[:-5])
        rows = (read_json(os.path.join(source, "hosts", name)) or {}).get("rows") or {}
        stored = legacy_rows(machine)
        for key, value in rows.items():
            old = stored.get(key)
            if old is None or sum(value[1:5]) > sum(old[1:5]):
                stored[key] = list(value)
                imported += 1
        write_json(legacy_path(machine), {"updated_at": datetime.now(TZ).isoformat(timespec="seconds"),
                                          "rows": stored})
        dates = sorted({key.split("|")[0] for key in stored})
        print("%-14s %4d rows  %s -> %s" % (machine, len(stored), dates[0], dates[-1]))
    print("seeded %d rows from %s" % (imported, source))


def add_backend(args):
    config = load_config()
    host = next((host for host in config["hosts"] if host["name"] == args.name), None)
    if host is None:
        sys.exit("No machine named %s; add it first." % args.name)
    backend = {"type": args.type}
    if args.tools:
        backend["tools"] = [tool.strip() for tool in args.tools.split(",") if tool.strip()]
    host["backends"].append(backend)
    save_config(config)
    print("Added %s backend to %s." % (args.type, args.name))


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--config", default=CONFIG)
    parser.add_argument("--timeout", type=int, default=1800)
    parser.add_argument("--publish", action="store_true", help="commit and push the snapshot to the blog repo")
    parser.add_argument("--json", action="store_true", help="print the snapshot to stdout")
    subparsers = parser.add_subparsers(dest="command")
    add = subparsers.add_parser("add-host")
    add.add_argument("name")
    add.add_argument("--ssh", help="ssh alias, when the machine is not this one")
    add.add_argument("--backend", default="python", choices=sorted(BACKENDS))
    add.add_argument("--tools", help="comma-separated tool filter")
    more = subparsers.add_parser("add-backend")
    more.add_argument("name")
    more.add_argument("--type", default="python", choices=sorted(BACKENDS), dest="type")
    more.add_argument("--tools")
    seed_parser = subparsers.add_parser("seed")
    seed_parser.add_argument("--source", default=os.path.expanduser("~/.local/state/ai-tokens"),
                             help="state directory of the older collector")
    subparsers.add_parser("status")
    args = parser.parse_args()

    if args.command == "seed":
        return seed(args)
    config = load_config(args.config)

    if args.command == "add-host":
        return add_host(args)
    if args.command == "add-backend":
        return add_backend(args)

    snapshot = build(config, args.timeout)
    output = os.path.expanduser(config["output"])
    if args.command == "status":
        for machine in snapshot["hosts"]:
            print("%-12s %12s tokens%s" % (machine["name"], "{:,}".format(machine["tokens"]),
                                          "  (stale)" if machine["stale"] else ""))
        for error in snapshot["_errors"]:
            print("  error: %s" % error, file=sys.stderr)
        return
    if args.json:
        json.dump(public(snapshot), sys.stdout, ensure_ascii=False, separators=(",", ":"))
        sys.stdout.write("\n")
        return
    if args.publish:
        publish(config, snapshot)  # compares before writing, then commits what changed
    else:
        public_snapshot = public(snapshot)
        write_json(output, public_snapshot, ensure_ascii=False, separators=(",", ":"))
        print("%d rows, %d machines, %d stale -> %s" % (
            len(public_snapshot["rows"]), public_snapshot["machines"], public_snapshot["stale_machines"], output))
    for error in snapshot["_errors"]:
        print("  error: %s" % error, file=sys.stderr)


if __name__ == "__main__":
    main()
