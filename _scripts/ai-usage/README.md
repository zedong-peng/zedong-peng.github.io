# AI usage collector

Counts AI token usage on three machines (mac, au-linux, fpga), merges it on the
mac, and writes one snapshot the blog publishes at `/life/`. Every number is the
API list price equivalent, not what any subscription actually cost.

The page reads `assets/ai-usage/data.json` in this repo. A daily `launchd` job on
the mac refreshes that file and commits it, so the chart is static, versioned in
git, and needs no server.

## Layout

| Path | What |
| --- | --- |
| `collect.py` | Merge machines and backends, write the snapshot, keep per-machine history |
| `ai_tokens.py` | Runs on a machine, reads its local logs, prints one JSON snapshot. Standard library only, piped over ssh |
| `prices.json` | Official USD per 1M tokens: `[input, cache_read, cache_write, output]` |
| `config.example.json` | Copy to `~/.config/ai-usage/config.json` |
| `test_collect.py` | Unit tests: `python3 test_collect.py` |

## Backends

| Type | Reads | Needs | Notes |
| --- | --- | --- | --- |
| `python` | Claude Code, Codex, OpenCode logs; Cursor's dashboard | Python 3.8+ | Default. Nothing installed remotely: `ai_tokens.py` is piped to `python3 -` |
| `ccusage` | The same logs, plus Gemini CLI, Copilot, Qwen, Kimi, pi and others | Node 18+ | Runs `npx ccusage daily --json --by-agent`; pin `version` |

Both read the same Claude Code and Codex logs, so **give each backend a `tools`
filter on a machine that has both**. Otherwise the merge keeps the larger of the
two (it never adds them), but the day's attribution is whichever saw more.

## Adding a machine

```bash
python3 collect.py add-host lab --ssh lab-box          # python backend, reads logs over ssh
python3 collect.py add-host lab --backend ccusage --tools claude-code,codex
python3 collect.py add-backend mac --type ccusage --tools gemini
python3 collect.py status                              # per-machine totals and errors
```

`--ssh` is an ssh alias on the mac; omit it for the machine the collector runs
on. The ssh key must be usable non-interactively (`BatchMode=yes`).

## Daily run

`install.sh` writes `~/Library/LaunchAgents/com.zedong.ai-usage.plist` and loads
it: 09:00 every day, plus once on load if the last run is older than a day.
Run it manually with:

```bash
python3 _scripts/ai-usage/collect.py --publish
```

`--publish` commits only when the rows changed, with
`data: AI usage snapshot YYYY-MM-DD (N rows, M machines)`, and pushes. The push
triggers the site deploy.

## History

Claude Code drops logs after about 30 days, so `collect.py` keeps
`~/.local/state/ai-usage/hosts/<machine>-<backend>.json` and merges by taking the
larger count for a day, tool and model. Days never shrink after a log is pruned.

`collect.py seed` imports the older collector's state
(`~/.local/state/ai-tokens/hosts/*.json`). Seeded rows live in
`<machine>-legacy.json` and are merged the same way, so running `seed` twice is
safe and the import can be repeated after moving machines.

## Counting rules

- One request counted once: Claude Code dedupes by message id + request id, Codex
  by cumulative snapshot, and sub-agent replays are dropped (same rules as
  ccusage).
- `input` is uncached input; `cache_read` and `cache_write` are separate.
- Cursor has no local token counts; its dashboard keeps about 3.5 months and is
  per account, so only the mac reads it.
