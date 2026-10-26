import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const exportRoot = resolve(process.argv[2] ?? "out");

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name, "en"),
  )) {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    } else {
      throw new Error(`Unsupported export entry: ${absolutePath}`);
    }
  }

  return files;
}

const files = await collectFiles(exportRoot);
const hash = createHash("sha256");

for (const absolutePath of files) {
  const relativePath = relative(exportRoot, absolutePath).split(sep).join("/");
  const pathBytes = Buffer.from(relativePath, "utf8");

  hash.update(`${pathBytes.byteLength}:`, "utf8");
  hash.update(pathBytes);
  hash.update("\0", "utf8");
  hash.update(await readFile(absolutePath));
  hash.update("\0", "utf8");
}

console.log(
  JSON.stringify(
    {
      algorithm: "sha256",
      digest: hash.digest("hex"),
      files: files.length,
      root: exportRoot,
      scheme: "sorted UTF-8 relative path length:path, NUL, file bytes, NUL",
    },
    null,
    2,
  ),
);
