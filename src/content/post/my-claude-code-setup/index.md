---
title: My Claude Code setup
description: A snapshot of the plugins, hooks, and status line I use to extend Claude Code.
publish: true
publishDate: 2026-05-09
type: note
tags:
  - ai
  - claude-code
  - tools
status: growing
created: 2026-05-02 04:00:04
updated: 2026-05-09 19:45:59
---

This is a snapshot of how I currently extend [Claude Code](https://www.anthropic.com/claude-code) — plugins, hooks, the status line, and the workflow patterns I rely on day to day.

The goal is not to install every tool I can find. I want a setup that makes Claude Code better at five things: finding context, following repeatable development workflows, reviewing its own work, coordinating with other agents, and staying visible while it works.

## Documentation and code intelligence

- [`context7`](https://github.com/anthropics/claude-plugins-official/tree/main/context7) for up-to-date documentation lookup against current library versions.
- `typescript-lsp`, `pyright-lsp`, `gopls-lsp`, and `swift-lsp` for language server support.

## Development workflow

- [`feature-dev`](https://github.com/anthropics/claude-plugins-official/tree/main/feature-dev) for the `code-architect` and `code-explorer` subagents I lean on during early architecture work. The plugin ships zero auto-triggering skills, so it stays out of the way until I explicitly call those agents.
- [`code-review`](https://github.com/anthropics/claude-plugins-official/tree/main/code-review) for ad-hoc code reviews via the `/code-review` slash command, separate from the deeper review loops below.
- [`superpowers`](https://github.com/obra/superpowers) for TDD discipline, systematic debugging, and the verification/review skills I rely on most. Paired with my own routing rules — see [Shaping skill behavior](#shaping-skill-behavior-with-rules) below.

## My own plugins

- `git-workflow` for repeatable Git operations and Conventional Commits.
- `mermaid-validator` for checking Mermaid diagrams in Markdown.
- `reviewer` for spec and implementation review loops, with `--parallel` multi-angle review and a `--fix` iteration mode.
- `digest` for summarizing branches, PRs, diffs, and design docs.
- `ralph-loop` for experimental long-running agent loops — used most often to wrap `reviewer` for iterative review-fix-review cycles (see [Workflow patterns](#workflow-patterns) below).

These live in my [agent-plugins](/projects/agent-plugins/) project.

## Hooks

- [`claude-hooks-notifier`](https://github.com/shdennlin/claude-hooks-notifier) for Telegram notifications on Claude Code hook events — useful when a long-running agent stops and needs me back at the keyboard.

## Cross-agent and behavior shaping

- [`codex`](https://github.com/openai/codex-plugin-cc) for delegating work from Claude Code to Codex. I use it selectively — second-opinion spec review and rescue runs, not every code change.
- [`andrej-karpathy-skills`](https://github.com/forrestchang/andrej-karpathy-skills) for reducing common LLM coding mistakes (over-engineering, untested assumptions, missing success criteria).
- [`security-guidance`](https://github.com/anthropics/claude-plugins-official/tree/main/security-guidance) for reminders about risky code edits.
- [`explanatory-output-style`](https://github.com/anthropics/claude-plugins-official/tree/main/explanatory-output-style) for more educational implementation explanations.

## Workflow patterns

Beyond the plugin list, a few patterns I rely on:

- **Spec-driven development as the default.** [Spectra](https://github.com/kaochenlong/Spectra) drives my workflow through `/spectra-discuss` → `/spectra-propose` → `/spectra-apply` → `/spectra-archive`. In-progress changes live in `openspec/changes/`; consolidated truth lives in `openspec/specs/`.
- **Ralph Loop for iterative review.** I wrap `/reviewer:spec` or `/reviewer:result` inside `/ralph-loop:ralph-loop` so the review-fix-review cycle keeps running until severity gates clear. MEDIUM is treated as a blocker, not as LOW.
- **Two-engine spec review for high-stakes specs.** For architectural or security-sensitive specs I dispatch two reviewers in parallel — Claude in this session and Codex via `codex:rescue` — then categorize findings as `Only Claude saw`, `Only Codex saw`, or `Both saw`. The reviewer plugin stays model-agnostic; the composition happens in a Raycast snippet, not in plugin code. The exact recipe lives in the [reviewer README](https://github.com/shdennlin/agent-plugins/blob/main/plugins/reviewer/README.md).
- **Result review uses one engine.** Spec errors propagate to all downstream implementation; result errors are localized. Multi-model review pays off on specs (1-3 dispatches per change, high error cost) but rarely on results (10+ iterations via ralph-loop, lower marginal value). Codex on result review is reserved for security-sensitive, concurrency, or performance-hotpath code.

## Shaping skill behavior with rules

`~/.claude/rules/skill-routing.md` is a user-instruction layer that overrides plugin-defined skill behavior. It is deliberately small — only three rules, each fixing a specific failure mode that Claude wouldn't avoid on its own:

- **Spectra-vs-superpowers routing.** In Spectra repos, prefer `spectra-discuss` / `spectra-debug` over the equivalent superpowers skills, so design and debugging stay tied to Spectra's artifacts.
- **Suppress `superpowers:brainstorming` auto-writing design docs.** The design discussion belongs in conversation; file output is friction.
- **Force-trigger `superpowers:verification-before-completion` and `superpowers:receiving-code-review`.** These are the two skills with the highest ROI — they keep "I claimed it was done" and "I blindly chased a reviewer suggestion" from happening.

Workflow sequencing (`discuss → propose → apply → archive`) is not in the rules — that's personal habit, not something Claude needs to enforce. User instructions outrank plugin-defined skill behavior, so superpowers stays installed (and gets upstream updates) while its rough edges get sanded down at user-instruction priority.

<details>
<summary>Full <code>~/.claude/rules/skill-routing.md</code></summary>

````markdown
# Skill Routing & Behavior Overrides

These rules override default skill behavior. **User instructions > superpowers skills > defaults**, so this file wins on conflict.

## 1. Spectra-vs-superpowers routing

In Spectra repos (`openspec/` exists at git root), prefer Spectra skills over superpowers equivalents — `spectra-discuss` over `superpowers:brainstorming`, `spectra-debug` over `superpowers:systematic-debugging`. Routing the request to superpowers bypasses Spectra's artifact tracking.

In non-Spectra repos this rule does not apply — superpowers wins because Spectra skills won't trigger anyway.

## 2. Behavior overrides on superpowers skills

### `superpowers:brainstorming`
- Do NOT automatically write `docs/superpowers/specs/YYYY-MM-DD-*-design.md` or any design doc file. Present the design in conversation only.
- Skip the "Write design doc" checklist step (step 6 in the SKILL).
- **Why**: I prefer in-conversation design discussion. File output is friction.

### `superpowers:using-superpowers`
- Do NOT add a TodoWrite todo per skill checklist item unless the task has 4+ genuinely independent sub-tasks.
- **Why**: TodoWrite spam clutters short tasks.

## 3. Force-trigger these superpowers skills

### `superpowers:verification-before-completion` ⭐ MANDATORY
- Trigger before claiming work is "done", "fixed", "passing", "ready", or before a commit / PR.
- Run the verification command (test, build, manual check) and paste the output. No verification = no claim of completion.

### `superpowers:receiving-code-review` ⭐ MANDATORY
- Trigger when applying review feedback from any review-fix loop (`reviewer:result-fixer`, `reviewer:spec-fixer`, `/codex:review`, etc.).
- For each review item, first verify the claim is technically correct. Push back with evidence on wrong/unnecessary suggestions instead of blindly implementing.
````

</details>

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
