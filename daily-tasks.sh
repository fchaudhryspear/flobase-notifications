#!/bin/bash
# ClawVault sync and memory backup - runs at 12am and 5pm

# Sync ClawVault
node ~/.openclaw/workspace/clawvault/bin/clawvault.js sync >> ~/.openclaw/workspace/clawvault/sync.log 2>&1

# Backup today's memory to ClawVault memories
MEMORY_FILE=~/.openclaw/workspace/simon/memory/$(date +%Y-%m-%d).md
if [ -f "$MEMORY_FILE" ]; then
    mkdir -p ~/.openclaw/workspace/clawvault/memories/
    cp "$MEMORY_FILE" ~/.openclaw/workspace/clawvault/memories/
fi