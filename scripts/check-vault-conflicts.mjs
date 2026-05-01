#!/usr/bin/env node
// Run before `dev` / `build` to detect iCloud sync conflicts inside the
// content folder. The vault lives in iCloud, which silently produces
// `* 2.md` and `* (conflicted YYYY-MM-DD).md` copies. Catching them here
// stops them ever reaching git.
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/content/post";
const PATTERNS = [/\s\d+\.(md|mdx)$/i, /\(conflicted/i, /\.icloud$/i];

const bad = [];
function walk(dir) {
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return;
	}
	for (const e of entries) {
		const p = join(dir, e);
		const s = statSync(p);
		if (s.isDirectory()) walk(p);
		else if (PATTERNS.some((rx) => rx.test(e))) bad.push(p);
	}
}
walk(ROOT);

if (bad.length > 0) {
	console.error("\n⚠️  iCloud / sync conflict files detected in vault:");
	for (const f of bad) console.error(`   - ${f}`);
	console.error(
		"\nResolve the conflict in Obsidian (keep the right copy, delete the rest)\nbefore continuing.\n",
	);
	process.exit(1);
}
