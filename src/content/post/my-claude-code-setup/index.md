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
updated: 2026-08-01 17:37:52
---

This is a snapshot of how I currently extend [Claude Code](https://www.anthropic.com/claude-code) — plugins, hooks, the status line, and the workflow patterns I rely on day to day.

The goal is not to install every tool I can find. I want a setup that makes Claude Code better at five things: finding context, following repeatable development workflows, reviewing its own work, coordinating with other agents, and staying visible while it works.

## Documentation and code intelligence

- [`context7`](https://github.com/upstash/context7) as an MCP server for up-to-date documentation lookup against current library versions. I run it as a plain MCP server rather than a plugin, with a small rule in `~/.claude/rules/context7.md` that says when Claude should reach for it.
- `typescript-lsp`, `pyright-lsp`, `gopls-lsp`, `rust-analyzer-lsp`, and `swift-lsp` for language server support.

## Development workflow

- [`feature-dev`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev) for the `code-architect` and `code-explorer` subagents I lean on during early architecture work. It is installed but switched off by default; I turn it on when I want those agents.
- [`code-review`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-review) for ad-hoc code reviews via the `/code-review` slash command, separate from the deeper review loops below. `reviewer` can also use it as a second engine.
- [`superpowers`](https://github.com/obra/superpowers) for TDD discipline, systematic debugging, and the verification/review skills I rely on most. Paired with my own routing rules — see [Shaping skill behavior](#shaping-skill-behavior-with-rules) below.

## My own plugins

- `git-workflow` for repeatable Git operations and Conventional Commits, mainly `/git-workflow:commit`.
- `mermaid-validator` for checking Mermaid diagrams in Markdown with `/mermaid-validator:check`.
- `reviewer` for spec and implementation review loops: `/reviewer:spec` before implementation, `/reviewer:result` after it, and `/reviewer:spec-dual` to cross-check a spec with Claude and Codex. Result review is multi-angle by default, and `--fix` runs the fix iterations.
- `digest` for summarizing branches, PRs, diffs, and design docs with `/digest:digest`.
- `discuss` for framing a decision before building: `/discuss:discuss` sizes the decision, then lists assumptions, ranks hypotheses, or interviews me, and converges on an explicit choice.
- `prompt-builder` for turning a messy session or a rough multi-task request into one paste-ready prompt that survives a rewind, with `/prompt-builder:build`.

`git-workflow`, `reviewer`, and `digest` have more commands than the ones above; the full list is in the [agent-plugins README](https://github.com/shdennlin/agent-plugins#readme).

A few of them are hook modules, TypeScript hooks that run inside Claude Code 2.1.289 or later, so they change the interface itself:

- [`cache-keepalive`](https://github.com/shdennlin/agent-plugins/tree/main/plugins/cache-keepalive) keeps the prompt cache warm while I am away. About five minutes before the cache TTL runs out it sends one tool-less ping, and it turns itself off if a ping does not actually read from the cache. `/keepalive status` shows its state and `/keepalive brb <minutes>` keeps the cache warm for longer.
- `cut-input` copies the prompt box to the clipboard and clears it (Ctrl+Shift+U).
- `image-peek` shows a thumbnail of each pasted image above the prompt, in terminals that draw kitty graphics.

These live in my [agent-plugins](/projects/agent-plugins/) project.

## Hooks

- [`session-notifier`](https://github.com/shdennlin/claude-hooks-notifier) for Telegram and macOS notifications on Claude Code hook events — useful when a long-running agent stops and needs me back at the keyboard.
- [`rtk hook claude`](https://github.com/rtk-ai/rtk) on `PreToolUse`, a token-optimized CLI proxy that rewrites shell commands so their output costs fewer tokens.
- `ccstatusline --hook` on `PreToolUse`, `UserPromptSubmit`, and `Stop`, which feeds the status line's skill widget (see [Status line](#status-line)).
- A small hook that reports whether an agent is waiting on me to [cmux](https://github.com/manaflow-ai/cmux), the terminal I run Claude Code in.

## Cross-agent and behavior shaping

- [`codex`](https://github.com/openai/codex-plugin-cc) for delegating work from Claude Code to Codex. I use it selectively — second-opinion spec review and rescue runs, not every code change.
- [`andrej-karpathy-skills`](https://github.com/forrestchang/andrej-karpathy-skills) for reducing common LLM coding mistakes (over-engineering, untested assumptions, missing success criteria).
- [`security-guidance`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/security-guidance) for reminders about risky code edits.
- [`explanatory-output-style`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/explanatory-output-style) for more educational implementation explanations.

## Tracking work with issue-graph

[`issue-graph`](https://github.com/shdennlin/issue-graph) is my self-hosted dependency graph and workstream tracker for Linear, and it ships a Claude Code plugin of the same name from its own marketplace (`/plugin marketplace add shdennlin/issue-graph`). I install it per project rather than globally: today that is my OneLegion repo, next to a project-scoped Linear MCP server.

A workstream is a feature in flight, drawn as the pipeline of stages it is moving through. The plugin connects a session to that board in four ways:

- **Presence hooks** report that a session is alive, working, waiting on me, or blocked on a permission prompt, so the card for the issue named in the branch shows what is happening right now. Only the session id, branch, working directory, and host are sent: no prompt text, file contents, or transcript. With `ISSUE_GRAPH_URL` or `ISSUE_GRAPH_TOKEN` unset, the plugin does nothing.
- **A start-of-session briefing** tells the session which workstream its branch belongs to, which stage it is on, and what is usually run at that stage. It states facts and gives no orders, and it is restored after a compaction.
- **An MCP server with 18 tools** for reading workstreams and stages, designing the pipeline, and moving work through it. `next_issue` claims the next unblocked issue in dependency order, and `report_done` releases it and unblocks whatever depended on it.
- **Two commands and a skill.** `/where` reports where the current branch sits in its workstream, and `/progress` records what a session finished (evidence, decisions, and a stage move only if the work really moved), using the `workstream-progress` skill.

## Mods from Anthropic

Two more hook modules, both from Anthropic rather than me:

- [`next-steps`](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps), from the community marketplace, suggests up to three next prompts above the input after each turn. Pressing 1, 2, or 3 drops one into the prompt box as a draft I can edit, and it never submits anything on its own.
- `cc-plugin-you-should-know`, a built-in, opt-in mod in which a side agent watches the session and flags things I or Claude might miss. I turned it on with `/plugin enable cc-plugin-you-should-know@builtin`.

## Workflow patterns

Beyond the plugin list, a few patterns I rely on:

- **Spec-driven development as the default.** [Spectra](https://spectra.5xcamp.us/) drives my workflow through `/spectra-discuss` → `/spectra-propose` → `/spectra-apply` → `/spectra-archive`. In-progress changes live in `openspec/changes/`; consolidated truth lives in `openspec/specs/`.
- **`/goal` for iterative review.** I run `/reviewer:spec` or `/reviewer:result` under Claude Code's built-in [`/goal`](https://code.claude.com/docs/en/goal), so the review-fix-review cycle keeps running until the severity gate clears. After each turn a separate evaluator checks the condition and starts another turn if it is not met. MEDIUM is treated as a blocker, not as LOW.
- **Two-engine spec review for high-stakes specs.** For architectural or security-sensitive specs I run `/reviewer:spec-dual`: Claude and Codex review the same change in parallel, and a workflow takes the union of their findings and loops the fixes until both engines are MEDIUM-clean. A blocker needs only one engine; clearing needs both. The details live in the [reviewer README](https://github.com/shdennlin/agent-plugins/blob/main/plugins/reviewer/README.md).
- **Result review uses one engine by default.** Spec errors propagate to all downstream implementation; result errors are localized. Multi-model review pays off on specs (1-3 dispatches per change, high error cost) but rarely on results (10+ iterations, lower marginal value). A second engine is one flag away (`-c` adds the built-in `/code-review`), and I reserve it for security-sensitive, concurrency, or performance-hotpath code.

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

[`ccstatusline`](https://github.com/sirmalloc/ccstatusline) drives a two-line status bar:

1. **Project and Claude** — current directory (via the [`showdir`](#showdir-helper) helper below), git branch with ahead/behind and change counts, worktree, model and thinking effort, Claude Code version, and a red alert that only appears when status.claude.com says Claude Code is not operational. The alert comes from a small script, `claude-status-alert`, that prints nothing when everything is healthy, so the segment stays hidden.
2. **Context, cache, and cost** — context-window percentage, prompt-cache hit rate with the [`cache-keepalive`](#my-own-plugins) widget next to it, a compaction counter (hidden at zero), 5-hour usage with its reset timer, weekly usage, session cost and duration, a short session ID, and the active skill.

Claude Code's own `statusLine` entry runs `ccstatusline` with `refreshInterval` set to 30 seconds, so the clock and usage keep moving while I am idle.

![[ccstatusline.png]]

The third line in the screenshot (`INSERT`, `auto mode`, the agent count) is Claude Code's own footer, not part of `ccstatusline`.

<details>
<summary>Full <code>~/.config/ccstatusline/settings.json</code></summary>

```json
{
  "version": 4,
  "lines": [
    [
      { "type": "custom-command", "commandPath": "showdir --icon" },
      { "type": "separator", "character": " │ " },
      { "type": "git-branch", "color": "brightGreen" },
      { "type": "custom-text", "customText": " " },
      { "type": "git-ahead-behind", "color": "brightYellow", "metadata": { "hide": "no-upstream" } },
      { "type": "custom-text", "customText": " " },
      { "type": "git-changes", "color": "brightYellow" },
      { "type": "separator", "character": " │ " },
      { "type": "git-worktree", "color": "blue" },
      { "type": "separator", "character": " │ " },
      { "type": "model", "color": "brightMagenta", "rawValue": true, "bold": true },
      { "type": "custom-text", "customText": " · ", "color": "brightBlack" },
      { "type": "thinking-effort", "color": "white", "rawValue": true },
      { "type": "separator", "character": " │ " },
      { "type": "version", "color": "brightBlue", "bold": true },
      { "type": "separator", "character": " │ " },
      { "type": "custom-command", "color": "brightRed", "bold": true, "commandPath": "~/.local/bin/claude-status-alert" }
    ],
    [
      { "type": "custom-text", "customText": "ctx ", "color": "brightGreen" },
      { "type": "context-percentage", "color": "brightGreen", "rawValue": true },
      { "type": "separator", "character": " │ " },
      { "type": "custom-text", "customText": "cache ", "color": "yellow" },
      { "type": "cache-hit-rate", "color": "yellow", "rawValue": true, "metadata": { "hide": "empty" } },
      { "type": "custom-command", "color": "yellow", "commandPath": "<agent-plugins>/plugins/cache-keepalive/bin/keepalive-cache --ttl 3600" },
      { "type": "separator", "character": " │ " },
      { "type": "compaction-counter", "color": "brightRed", "metadata": { "format": "icon-space-number", "nerdFont": "true", "hide": "zero" } },
      { "type": "separator", "character": " │ " },
      { "type": "custom-text", "customText": "5h ", "color": "brightCyan" },
      { "type": "session-usage", "color": "brightCyan", "rawValue": true },
      { "type": "custom-text", "customText": " ↻", "color": "brightCyan" },
      { "type": "reset-timer", "color": "brightCyan", "rawValue": true, "metadata": { "display": "time", "compact": "true" } },
      { "type": "separator", "character": " │ " },
      { "type": "custom-text", "customText": "wk ", "color": "brightBlue" },
      { "type": "weekly-usage", "color": "brightBlue", "rawValue": true },
      { "type": "separator", "character": " │ " },
      { "type": "session-cost", "color": "brightWhite", "rawValue": true },
      { "type": "custom-text", "customText": "·", "color": "brightBlack" },
      { "type": "session-clock", "color": "brightWhite", "rawValue": true },
      { "type": "separator", "character": " │ " },
      { "type": "custom-command", "color": "cyan", "commandPath": "jq -r '.session_id[0:8]'" },
      { "type": "separator", "character": " │ " },
      { "type": "skills", "color": "brightCyan", "metadata": { "hide": "empty" } }
    ]
  ],
  "flexMode": "full",
  "compactThreshold": 60,
  "colorLevel": 3
}
```

I omitted the per-widget `id` UUIDs and the defaulted fields for readability, and shortened two paths (`<agent-plugins>` is wherever the plugin is checked out); `ccstatusline` regenerates the IDs on first save.

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
