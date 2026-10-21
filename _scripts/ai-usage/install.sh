#!/bin/sh
# Load the daily collector as a launchd agent. Run once on the mac.
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
LABEL=com.zedong.ai-usage
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ ! -f "$HOME/.config/ai-usage/config.json" ]; then
  mkdir -p "$HOME/.config/ai-usage"
  cp "$HERE/config.example.json" "$HOME/.config/ai-usage/config.json"
  echo "Wrote $HOME/.config/ai-usage/config.json; check output and repo paths."
fi

mkdir -p "$HOME/Library/LaunchAgents" "$HOME/.local/state/ai-usage"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>$HERE/collect.py</string>
    <string>--publish</string>
  </array>
  <key>WorkingDirectory</key><string>$HERE</string>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>$HOME/.local/state/ai-usage/collect.log</string>
  <key>StandardErrorPath</key><string>$HOME/.local/state/ai-usage/collect.log</string>
  <key>RunAtLoad</key><true/>
  <key>ProcessType</key><string>Background</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Loaded $LABEL: daily at 09:00, log at ~/.local/state/ai-usage/collect.log"
