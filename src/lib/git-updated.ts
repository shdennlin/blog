import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Best-effort: return the file's last commit timestamp from git, or
 * fall back to filesystem mtime. Cached per absolute path.
 *
 * Used to auto-fill `updatedDate` when frontmatter omits it — saves the
 * author from forgetting to bump it on every Obsidian edit.
 */

const cache = new Map<string, Date | undefined>();

export function getLastGitDate(filePath: string): Date | undefined {
	const abs = resolve(filePath);
	if (cache.has(abs)) return cache.get(abs);
	if (!existsSync(abs)) {
		cache.set(abs, undefined);
		return undefined;
	}
	try {
		const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", abs], {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "ignore"],
		}).trim();
		if (out) {
			const d = new Date(out);
			cache.set(abs, d);
			return d;
		}
	} catch {
		// fall through
	}
	const mtime = statSync(abs).mtime;
	cache.set(abs, mtime);
	return mtime;
}
