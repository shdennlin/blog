---
title: Dotfiles
description: My cross-platform development environment managed with chezmoi.
publish: true
publishDate: 2026-05-02
type: project
tags: [dotfiles, tools]
status: evergreen
created: 2026-05-02 03:43:26
updated: 2026-05-02 04:17:05
---

## What it is

[dotfiles](https://github.com/shdennlin/dotfiles) is my personal development environment setup for macOS and Linux, managed with [chezmoi](https://www.chezmoi.io/).

It includes configuration for `Git`, `Neovim`, `Tmux`, `Zsh`, shell helpers, and a bootstrap package list for setting up a new machine more quickly.

## Why I keep it

I use it to make my working environment portable. When I move between machines, rebuild a system, or set up a fresh environment, I want the important parts of my workflow to come back quickly without relying on memory.

The goal is not to make a perfect universal setup. It is to keep the pieces I actually use close to source control: editor config, shell behavior, terminal tooling, Git defaults, and machine bootstrap notes.

## Why dotfiles matter

A development environment is part of how I think. Editor shortcuts, shell aliases, Git defaults, terminal behavior, and installed tools all shape how quickly I can move from an idea to a working change.

Keeping those choices in dotfiles makes the environment reproducible instead of accidental. It also forces me to turn small workflow decisions into something explicit: if a shortcut, package, or shell helper is worth keeping, it should be understandable enough to live in source control.

## Design notes

I try to keep the setup practical rather than minimal for its own sake. Some parts are automated because I repeat them often; other parts stay manual because they depend on the machine or the moment.

The repo is not meant to be a universal dotfiles framework. It is a record of the environment I actually use, shaped by the way I write, debug, automate, and experiment with tools.

## Current status

Actively maintained for my own use. The repo currently targets macOS, Debian-based Linux distributions, and Arch-based Linux distributions, with other Linux distributions treated as less tested.

Detailed package lists and installation behavior live in the repository itself rather than on this site.

## Reference and contributions

Feel free to read through the repo, borrow ideas for your own dotfiles, or adapt parts of the setup to your own workflow. If you notice something that can be improved, PRs and suggestions are welcome.
