---
title: My Claude Code plugin setup
description: A snapshot of the Claude Code plugins I currently use and why.
publish: true
publishDate: 2026-05-02
type: note
tags: [ai, claude-code, tools]
status: growing
created: 2026-05-02 04:00:04
updated: 2026-05-02 04:17:05
---

This is a snapshot of the [Claude Code](https://www.anthropic.com/claude-code) plugins I currently use.

The goal is not to install every plugin I can find. I want a setup that makes Claude Code better at four things: finding context, following repeatable development workflows, reviewing its own work, and coordinating with other agents.

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

## Cross-agent and behavior shaping

- `codex` for delegating work from Claude Code to Codex.
- `andrej-karpathy-skills` for reducing common LLM coding mistakes.
- `security-guidance` for reminders about risky code edits.
- `explanatory-output-style` for more educational implementation explanations.

## How I decide whether a plugin stays

A plugin is worth keeping if it reduces repeated prompting, improves review quality, catches mistakes, or turns a workflow I already use into something repeatable.

If a plugin only feels impressive once but does not change my daily workflow, it probably does not belong in the setup.
