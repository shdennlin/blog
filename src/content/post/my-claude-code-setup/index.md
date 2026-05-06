---
title: My Claude Code setup
description: A snapshot of the plugins, hooks, and status line I use to extend Claude Code.
publish: true
publishDate: 2026-05-02
type: note
tags: [ai, claude-code, tools]
status: growing
created: 2026-05-02 04:00:04
updated: 2026-05-07 00:17:57
---

This is a snapshot of how I currently extend [Claude Code](https://www.anthropic.com/claude-code) — plugins, hooks, and the status line.

The goal is not to install every tool I can find. I want a setup that makes Claude Code better at five things: finding context, following repeatable development workflows, reviewing its own work, coordinating with other agents, and staying visible while it works.

## Documentation and code intelligence

- `context7` for up-to-date documentation lookup.
- `typescript-lsp`, `pyright-lsp`, `gopls-lsp`, and `swift-lsp` for language server support.

## Development workflow

- `feature-dev` for structured feature development.
- `code-review` for automated review with specialized agents.
- `code-simplifier` for simplifying code while preserving behavior.
- `superpowers` for stronger TDD, debugging, and collaboration workflows.

## My own plugins

- `git-workflow` for repeatable Git operations and Conventional Commits.
- `mermaid-validator` for checking Mermaid diagrams in Markdown.
- `reviewer` for spec and implementation review loops.
- `digest` for summarizing branches, PRs, diffs, and design docs.
- `ralph-loop` for experimental long-running agent loops.

These live in my [agent-plugins](/projects/agent-plugins/) project.

## Hooks

- [`claude-hooks-notifier`](https://github.com/shdennlin/claude-hooks-notifier) for Telegram notifications on Claude Code hook events — useful when a long-running agent stops and needs me back at the keyboard.

## Cross-agent and behavior shaping

- `codex` for delegating work from Claude Code to Codex.
- `andrej-karpathy-skills` for reducing common LLM coding mistakes.
- `security-guidance` for reminders about risky code edits.
- `explanatory-output-style` for more educational implementation explanations.

## Status line

[`ccstatusline`](https://github.com/sirmalloc/ccstatusline) drives a three-line status bar:

1. **Project** — current directory (via the [`showdir`](#showdir-helper) helper below), git branch, change count, worktree.
2. **Model and tokens** — model name, context-window percentage, input / output / cached / total token counts, active skill count.
3. **Time and cost** — thinking-effort tier, wall clock, session duration, session cost, reset timer, current 5-hour-block usage, weekly usage, session ID, Claude Code version.

![[ccstatusline.png]]

<details>
<summary>Full <code>~/.config/ccstatusline/settings.json</code></summary>

```json
{
  "version": 3,
  "lines": [
    [
      { "type": "custom-command", "commandPath": "showdir --icon" },
      { "type": "separator" },
      { "type": "git-branch", "color": "brightGreen", "metadata": { "hideNoGit": "false" } },
      { "type": "separator", "character": " " },
      { "type": "git-changes" },
      { "type": "separator", "character": " " },
      { "type": "git-worktree", "color": "hex:FDC700" }
    ],
    [
      { "type": "model", "color": "green", "rawValue": true },
      { "type": "separator", "character": "|" },
      { "type": "context-percentage", "color": "brightGreen" },
      { "type": "separator", "character": "," },
      { "type": "tokens-input", "color": "brightMagenta" },
      { "type": "separator", "character": "," },
      { "type": "tokens-output", "color": "brightMagenta" },
      { "type": "separator", "character": "," },
      { "type": "tokens-cached", "color": "brightMagenta" },
      { "type": "separator", "character": "," },
      { "type": "tokens-total", "color": "brightMagenta" },
      { "type": "separator", "character": "|" },
      { "type": "skills", "color": "brightCyan" }
    ],
    [
      { "type": "thinking-effort", "color": "white", "rawValue": true },
      { "type": "separator", "character": "," },
      { "type": "custom-command", "color": "brightCyan", "commandPath": "date \"+%m-%d %H:%M:%S\"" },
      { "type": "separator", "character": "," },
      { "type": "session-clock", "rawValue": true },
      { "type": "separator", "character": " " },
      { "type": "session-cost", "color": "cyan", "rawValue": true },
      { "type": "separator" },
      { "type": "reset-timer", "color": "brightYellow", "metadata": { "display": "time", "compact": "true" } },
      { "type": "custom-text", "color": "brightBlue", "customText": " b:" },
      { "type": "session-usage", "rawValue": true },
      { "type": "custom-text", "color": "brightBlue", "customText": " w:" },
      { "type": "weekly-usage", "rawValue": true },
      { "type": "separator", "character": "," },
      { "type": "claude-session-id", "color": "cyan", "rawValue": true },
      { "type": "separator", "character": "," },
      { "type": "version", "color": "brightWhite" }
    ]
  ],
  "flexMode": "full-minus-40",
  "compactThreshold": 60,
  "colorLevel": 3,
  "inheritSeparatorColors": true,
  "powerline": { "enabled": false }
}
```

I omitted the per-widget `id` UUIDs and a few defaulted fields for readability; `ccstatusline` regenerates the IDs on first save.

</details>

### `showdir` helper

The first widget on line 1 shells out to `~/.local/bin/showdir`, a small POSIX script that prints a project-relative path. Inside a git repo it prints `<repo>/<relative-path>` with a 📂 prefix; outside, `<parent>/<dir>` with 📁. Shorter and more useful than the full absolute path that would otherwise eat half the line.

<details>
<summary>Full <code>~/.local/bin/showdir</code></summary>

```sh
#!/usr/bin/env sh
# Usage: showdir [--icon] [-n|--no-newline]

icon=0; noline=0
while [ $# -gt 0 ]; do
  case "$1" in
    --icon) icon=1 ;;
    -n|--no-newline) noline=1 ;;
  esac
  shift
done

prefix_icon=""
if git_root=$(git rev-parse --show-toplevel 2>/dev/null); then
  project=${git_root##*/}
  case "$PWD" in
    "$git_root"|"${git_root%/}") rel="";;
    *) rel=${PWD#"$git_root"/};;
  esac
  [ "$icon" -eq 1 ] && prefix_icon="📂 "
  out=$project${rel:+"/$rel"}
else
  path=$PWD
  last=${path##*/}
  parent=${path%/*}
  second_last=${parent##*/}
  [ "$second_last" = "$last" ] && out="$last" || out="$second_last/$last"
  [ "$icon" -eq 1 ] && prefix_icon="📁 "
fi

if [ "$noline" -eq 1 ]; then
  printf "%s%s" "$prefix_icon" "$out"
else
  printf "%s%s\n" "$prefix_icon" "$out"
fi
```

</details>

## How I decide whether something stays

A tool is worth keeping if it reduces repeated prompting, improves review quality, catches mistakes, or turns a workflow I already use into something repeatable.

If it only feels impressive once but does not change my daily workflow, it probably does not belong in the setup.
