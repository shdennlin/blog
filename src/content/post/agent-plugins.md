---
title: Agent Plugins
description: A collection of plugins and workflows for AI coding agents.
publish: true
publishDate: 2026-05-02
type: project
tags: [ai, tools]
status: evergreen
created: 2026-05-02 03:47:53
updated: 2026-05-02 04:17:04
---

## What it is

[agent-plugins](https://github.com/shdennlin/agent-plugins) is my collection of plugins, commands, skills, hooks, and agent workflows for AI coding agents such as Claude Code, Codex, and other agentic development tools.

It currently includes plugins for Mermaid validation, Git workflow automation, structured spec and implementation review, branch/PR digests, release summaries, and longer-running agent loops.

## Why I am building it

I use AI coding agents a lot, but raw prompting is not enough. The useful parts of an agent workflow need structure: repeatable commands, clear review loops, installation paths, and conventions that can be reused across projects.

This repo is where I turn recurring agent workflows into something more durable than a one-off prompt. If a workflow is useful more than a few times, it probably deserves a plugin, a command, or a skill.

## Design notes

The goal is to make agent-assisted development more reliable, not just more automatic. I care about workflows that help agents check specs, review implementations, summarize changes, validate diagrams, and keep Git operations boring.

The repo supports Claude Code through a plugin marketplace and supports Codex through per-plugin install instructions. That lets the same workflow ideas move across different agent tools instead of being locked to one interface.

## Current status

Actively maintained for my own AI-assisted development workflow. The plugin catalog is still evolving as I find repeated patterns worth extracting.

## Reference and contributions

Feel free to inspect the plugins, adapt the ideas to your own agent workflows, or send PRs if you see a cleaner way to package one of the workflows.

I am especially interested in ideas that make agent-assisted development more reviewable, repeatable, and less dependent on one-off prompting. If you have a workflow that works well for your own agents, I would be happy to learn from it or discuss how it could become a reusable plugin.
